SHELL := /bin/bash

all: _site

clean:
	rm -rf _site
	rm -rf _software/*/.git _software/*/docs _software/_*_repo parent-hub/*
	rm -rf .sass-cache .jekyll-cache .jekyll-metadata

bundle:
	bundle

_site:
	bundle exec jekyll build --trace

serve:
	bundle exec jekyll serve --trace

.PHONY: bundle all open serve distclean clean
