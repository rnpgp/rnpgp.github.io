SHELL := /bin/bash
RNP_ZIP_VERSION := 0.16.3
CLEAN_TARGETS := _site _man_pages rnp.zip

all: _site

rnp.zip:
	curl -sSL https://github.com/rnpgp/rnp/archive/refs/tags/v${RNP_ZIP_VERSION}.zip -o $@

_man_pages: rnp.zip
	mkdir -p $@; \
	unzip -jd $@ $< "*.1.adoc" "*.3.adoc"; \
	find $@ -name '*.adoc' -exec sed -i.bak -e '2,3d' {} \; ; \
	find $@ -name '*.adoc' -exec sed -i.bak 's/{component-version}/${RNP_ZIP_VERSION}/g' {} \; ; \
	find $@ -name '*.adoc' -exec sed -i.bak 's/{release-version}/${RNP_ZIP_VERSION}/g' {} \; ; \
	find $@ -name '*.adoc' -exec sed -i.bak 's/^= \(.*\)$$/---\ntitle: \1\nexcerpt: man page for \1, version ${RNP_ZIP_VERSION}\n---/g' {} \; ; \
	rm -f $@/*.bak

clean:
	rm -rf ${CLEAN_TARGETS}
	rm -rf _software/*/.git _software/*/docs _software/_*_repo parent-hub/*
	rm -rf .sass-cache .jekyll-cache .jekyll-metadata

bundle:
	bundle

_site: _man_pages
	bundle exec jekyll build --trace

serve: _man_pages
	bundle exec jekyll serve --trace

.PHONY: bundle all open serve clean
