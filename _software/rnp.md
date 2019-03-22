---
title: RNP
repo_url: https://github.com/riboseinc/rnp
description: C library approach to OpenPGP. A GnuPG alternative.
tags: ["writtenin:C++"]
docs:
  git_repo_url: https://github.com/strogonoff/rnp
  git_repo_subtree: docs

feature_with_priority: 1
---

RNP is a set of OpenPGP (RFC4880) tools that works on Linux, *BSD and
macOS as a replacement of GnuPG. It is maintained by Ribose after being
forked from NetPGP, itself originally written for NetBSD.

"librnp" is the library used by rnp for all OpenPGP functions, useful
for developers to build against. Thanks to Alistair, it is a "real"
library, not a wrapper like GPGME of GnuPG.

NetPGP was originally written (and still maintained) by Alistair Crooks
of NetBSD.
