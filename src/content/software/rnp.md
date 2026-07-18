---
title: RNP
repo_url: "https://github.com/rnpgp/rnp"
description: C++ OpenPGP library and tools

external_links:
  - { url: "https://github.com/rnpgp/rnp/releases", title: Download }
  - { url: "https://github.com/rnpgp/rnp", title: Source }

tags: ["writtenin:C++"]
docs_repo: https://github.com/rnpgp/rnp
docs_subtree: docs
docs_ref: v0.18.1 # pinned RNP release tag (also bump RNP_VERSION in src/content.config.ts)

feature_with_priority: 1
---

RNP is a set of openly-licensed OpenPGP (RFC4880) tools that works on
all major platforms, including Windows, macOS, Linux and *BSD.

This includes the executables `rnp` for handling OpenPGP data and
`rnpkeys` for key management.
`librnp` is the core library used for all OpenPGP functions.
