#!/bin/bash
# To exclude *.fr.yml:
# GLOBIGNORE=*.fr.yml
# Files with a "history: action: removed" entry are ignored.
grep -L -Z -E '^[[:space:]]*-[[:space:]]*action:[[:space:]]*removed' ../data/orgs/*.yml \
  | xargs -0 -r sed -e '/#/d' -e '/https:/!d' -e 's/.*\(https:\)/\1/' \
  | sort -u
