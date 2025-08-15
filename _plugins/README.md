# RNP Man Pages Generator Plugin

This Jekyll plugin automatically downloads and processes RNP manual pages from GitHub releases during the Jekyll build process, replacing the previous Makefile-based approach.

## Features

- **Automatic Download**: Downloads man pages from RNP GitHub releases
- **Smart Caching**: Caches downloaded content to avoid unnecessary API calls
- **Version Management**: Processes all RNP releases and organizes by version
- **Jekyll Integration**: Converts AsciiDoc files with proper Jekyll front matter
- **Permalink Generation**: Creates unique URLs for each version's man pages
- **Latest Symlink**: Maintains a 'latest' symlink pointing to the newest version

## Configuration

The plugin can be configured in `_config.yml`:

```yaml
rnp:
  man_pages:
    enabled: true                    # Enable/disable the plugin (default: true)
    include_prereleases: false       # Include pre-release versions (default: false)
    cache_duration: 86400           # Cache duration in seconds (default: 24 hours)
    github:
      token: "your_token_here"      # GitHub token for API access (optional)
```

You can also set the GitHub token via the `GITHUB_TOKEN` environment variable.

## How It Works

1. **Release Discovery**: Uses GitHub API to fetch all RNP releases
2. **Archive Processing**: Downloads release archives and extracts man pages
3. **Content Processing**: Converts AsciiDoc titles to Jekyll front matter
4. **Caching**: Stores metadata to avoid re-downloading unchanged releases
5. **Index Generation**: Creates a version index page with links to all versions
6. **Symlink Creation**: Creates a 'latest' symlink for easy access

## File Structure

The plugin generates the following structure in `_man_pages/`:

```
_man_pages/
├── index.md                 # Version index page
├── latest/                  # Symlink to latest version
├── v0.17.1/
│   ├── rnp.1.adoc
│   ├── rnpkeys.1.adoc
│   └── librnp.3.adoc
├── v0.17.0/
│   └── ...
└── ...
```

## URLs

Each man page gets a unique permalink:
- `/docs/{version}/{page}/` (e.g., `/docs/0.17.1/rnp.1/`)

## Caching

The plugin maintains a `.man_pages_cache.json` file to track:
- When each version was last processed
- Release publication dates
- Cache timestamps

This ensures efficient builds by only processing new or updated releases.

## Dependencies

The plugin requires these Ruby gems (already in Gemfile):
- `octokit` - GitHub API client
- `rubyzip` - ZIP file processing
- `net-http` - HTTP requests

## Error Handling

The plugin includes robust error handling:
- Network failures are logged but don't stop the build
- Missing man pages in older releases are handled gracefully
- Existing man pages are preserved if the plugin fails

## Development

To force a fresh download (useful for testing):
```bash
rm -f .man_pages_cache.json
bundle exec jekyll build
```

To see debug output:
```bash
JEKYLL_LOG_LEVEL=debug bundle exec jekyll build
```
