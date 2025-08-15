require 'octokit'
require 'zip'
require 'fileutils'
require 'tempfile'
require 'json'
require 'digest'
require 'net/http'
require 'uri'

module Jekyll
  class ManPagesGenerator < Generator
    safe true
    priority :highest

    def generate(site)
      @site = site
      @config = site.config['rnp'] || {}

      # Default configuration
      @enabled = @config.dig('man_pages', 'enabled') != false
      @include_prereleases = @config.dig('man_pages', 'include_prereleases') || false
      @cache_duration = @config.dig('man_pages', 'cache_duration') || 86400
      @github_token = @config.dig('man_pages', 'github', 'token') || ENV['GITHUB_TOKEN']

      return unless @enabled

      Jekyll.logger.info "ManPages:", "Generating man pages for all RNP releases"

      begin
        @github_client = GitHubClient.new(@github_token)
        @release_manager = ReleaseManager.new(@github_client, @include_prereleases)
        @cache_manager = CacheManager.new(@site.source, @cache_duration)
        @archive_processor = ArchiveProcessor.new(@github_client)
        @man_page_processor = ManPageProcessor.new
        @version_index_generator = VersionIndexGenerator.new

        ensure_man_pages_directory
        process_all_releases
        generate_version_index
        create_latest_symlink

      rescue => e
        Jekyll.logger.error "ManPages:", "Failed to generate man pages: #{e.message}"
        Jekyll.logger.error "ManPages:", e.backtrace.join("\n") if Jekyll.env == 'development'
        Jekyll.logger.warn "ManPages:", "Continuing with existing man pages if available"
      end
    end

    private

    def ensure_man_pages_directory
      @man_pages_dir = File.join(@site.source, '_man_pages')
      FileUtils.mkdir_p(@man_pages_dir) unless Dir.exist?(@man_pages_dir)
    end

    def process_all_releases
      releases = @release_manager.get_all_releases
      Jekyll.logger.info "ManPages:", "Found #{releases.length} releases to process"

      releases.each do |release|
        version = release[:tag_name].sub(/^v/, '')
        version_dir = File.join(@man_pages_dir, "v#{version}")

        if @cache_manager.should_update_version?(version, release[:published_at])
          Jekyll.logger.info "ManPages:", "Processing RNP v#{version}..."
          process_release(release, version_dir)
          @cache_manager.update_version_cache(version, release[:published_at])
        else
          Jekyll.logger.debug "ManPages:", "Skipping v#{version} (cached and fresh)"
        end
      end
    end

    def process_release(release, version_dir)
      FileUtils.mkdir_p(version_dir)

      archive_data = @archive_processor.download_release_archive(release[:zipball_url])
      man_pages = @archive_processor.extract_man_pages(archive_data)

      man_pages.each do |filename, content|
        version = release[:tag_name].sub(/^v/, '')
        processed_content = @man_page_processor.process_content(content, filename, version)
        output_path = File.join(version_dir, filename)
        File.write(output_path, processed_content)
      end

      Jekyll.logger.info "ManPages:", "Successfully processed #{man_pages.length} man pages for v#{release[:tag_name].sub(/^v/, '')}"
    end

    def generate_version_index
      releases = @release_manager.get_all_releases
      index_content = @version_index_generator.generate_index(releases)
      index_path = File.join(@man_pages_dir, 'index.md')
      File.write(index_path, index_content)
      Jekyll.logger.info "ManPages:", "Generated version index with #{releases.length} versions"
    end

    def create_latest_symlink
      releases = @release_manager.get_all_releases
      return if releases.empty?

      latest_version = releases.first[:tag_name].sub(/^v/, '')
      latest_dir = "v#{latest_version}"
      symlink_path = File.join(@man_pages_dir, 'latest')

      # Remove existing symlink if it exists
      File.unlink(symlink_path) if File.symlink?(symlink_path)

      # Create new symlink
      File.symlink(latest_dir, symlink_path)
      Jekyll.logger.info "ManPages:", "Created 'latest' symlink pointing to v#{latest_version}"
    end
  end

  class GitHubClient
    def initialize(token = nil)
      @client = Octokit::Client.new(access_token: token)
      @client.auto_paginate = true
    end

    def get_releases(repo)
      @client.releases(repo)
    end

    def download_file(url)
      uri = URI(url)
      redirect_count = 0
      max_redirects = 5

      loop do
        Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == 'https') do |http|
          request = Net::HTTP::Get.new(uri)
          response = http.request(request)

          case response.code
          when '200'
            return response.body
          when '301', '302', '303', '307', '308'
            redirect_count += 1
            if redirect_count > max_redirects
              raise "Too many redirects (#{redirect_count}) for #{url}"
            end

            location = response['location']
            if location.nil?
              raise "Redirect response missing location header for #{url}"
            end

            uri = URI(location)
            Jekyll.logger.debug "ManPages:", "Following redirect to #{uri}"
            next
          else
            raise "Failed to download #{url}: HTTP #{response.code}"
          end
        end
      end
    end
  end

  class ReleaseManager
    def initialize(github_client, include_prereleases = false)
      @github_client = github_client
      @include_prereleases = include_prereleases
      @repo = 'rnpgp/rnp'
    end

    def get_all_releases
      releases = @github_client.get_releases(@repo)

      # Filter out prereleases if not wanted
      releases = releases.reject(&:prerelease) unless @include_prereleases

      # Convert to hash format and sort by version (newest first)
      releases.map do |release|
        {
          tag_name: release.tag_name,
          name: release.name,
          published_at: release.published_at,
          zipball_url: release.zipball_url,
          prerelease: release.prerelease
        }
      end.sort_by { |r| Gem::Version.new(r[:tag_name].sub(/^v/, '')) }
    end
  end

  class ArchiveProcessor
    def initialize(github_client)
      @github_client = github_client
    end

    def download_release_archive(zipball_url)
      @github_client.download_file(zipball_url)
    end

    def extract_man_pages(archive_data)
      man_pages = {}

      Tempfile.create(['rnp', '.zip']) do |temp_file|
        temp_file.binmode
        temp_file.write(archive_data)
        temp_file.rewind

        Zip::File.open(temp_file.path) do |zip_file|
          zip_file.each do |entry|
            next unless entry.file?
            next unless entry.name.match?(/\.(1|3)\.adoc$/)

            filename = File.basename(entry.name)
            content = entry.get_input_stream.read
            man_pages[filename] = content
          end
        end
      end

      man_pages
    end
  end

  class ManPageProcessor
    def process_content(content, filename, version)
      lines = content.lines

      # Remove lines 2-3 (metadata lines) if they exist
      if lines.length >= 3
        lines = [lines[0]] + lines[3..-1]
      end

      content = lines.join

      # Replace version placeholders
      content = content.gsub('{component-version}', version)
      content = content.gsub('{release-version}', version)

      # Convert AsciiDoc title to Jekyll front matter
      if content.match(/^= (.+)$/)
        title = $1

        # Generate permalink based on version and filename
        base_name = File.basename(filename, '.adoc')
        permalink = "/docs/#{version}/#{base_name}/"

        # Create Jekyll front matter
        front_matter = [
          "---",
          "title: #{title}",
          "excerpt: man page for #{title}, version #{version}",
          "version: #{version}",
          "permalink: #{permalink}",
          "---"
        ].join("\n")

        # Replace the AsciiDoc title with front matter
        content = content.sub(/^= .+$/, front_matter)
      end

      content
    end
  end

  class CacheManager
    def initialize(source_dir, cache_duration)
      @source_dir = source_dir
      @cache_duration = cache_duration
      @cache_file = File.join(source_dir, '.man_pages_cache.json')
      load_cache
    end

    def should_update_version?(version, published_at)
      return true unless @cache_data['versions']

      version_cache = @cache_data['versions'][version]
      return true unless version_cache

      cached_time = Time.parse(version_cache['cached_at'])
      published_time = Time.parse(published_at.to_s)

      # Update if cache expired or if the published date is newer than cached
      return true if Time.now - cached_time > @cache_duration
      return true if published_time > Time.parse(version_cache['published_at'])

      false
    end

    def update_version_cache(version, published_at)
      @cache_data['versions'] ||= {}
      @cache_data['versions'][version] = {
        'cached_at' => Time.now.iso8601,
        'published_at' => published_at.to_s
      }
      save_cache
    end

    private

    def load_cache
      if File.exist?(@cache_file)
        begin
          @cache_data = JSON.parse(File.read(@cache_file))
        rescue
          @cache_data = {}
        end
      else
        @cache_data = {}
      end
    end

    def save_cache
      File.write(@cache_file, JSON.pretty_generate(@cache_data))
    end
  end

  class VersionIndexGenerator
    def generate_index(releases)
      content = [
        "---",
        "title: RNP Man Pages",
        "excerpt: Manual pages for all RNP versions",
        "layout: docs-index",
        "---",
        "",
        "# RNP Manual Pages",
        "",
        "This page provides access to manual pages for all versions of RNP.",
        "",
        "## Available Versions",
        ""
      ]

      releases.each do |release|
        version = release[:tag_name].sub(/^v/, '')
        published_date = Time.parse(release[:published_at].to_s).strftime('%Y-%m-%d')

        content << "### [RNP v#{version}](v#{version}/) #{release[:prerelease] ? '(Pre-release)' : ''}"
        content << "Released: #{published_date}"
        content << ""
        content << "- [rnp.1](/docs/#{version}/rnp.1/) - RNP command-line tool"
        content << "- [rnpkeys.1](/docs/#{version}/rnpkeys.1/) - RNP key management tool"
        content << "- [librnp.3](/docs/#{version}/librnp.3/) - RNP library API"
        content << ""
      end

      content << "## Latest Version"
      content << ""
      unless releases.empty?
        latest_version = releases.first[:tag_name].sub(/^v/, '')
        content << "The latest stable version is [RNP v#{latest_version}](latest/), which is an alias for [v#{latest_version}](v#{latest_version}/)."
      end

      content.join("\n")
    end
  end
end
