#!/bin/bash
# To exclude *.fr.yml:
# GLOBIGNORE=*.fr.yml
sed -e '/#/d' -e '/https:/!d' -e 's/.*\(https:\)/\1/' ../data/orgs/*.yml | sort -u
