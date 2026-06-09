#!/bin/bash
# To exclude *.fr.yml:
# GLOBIGNORE=*.fr.yml
# Files with a "history: action: removed" entry are ignored.
grep -L -Z -E '^[[:space:]]*-[[:space:]]*action:[[:space:]]*removed' ../data/orgs/*.yml \
  | xargs -0 -r sed -e '/#/d' -e '/https:/!d' -e 's/.*\(https:\)/\1/' \
  | sort -u | while read line
#(echo https://nafsddsfsdf.ch; echo https://wustl.edu; echo https://wustl.edu/dasdfasdfasdfa) | while read line
do
  if status=$(curl --connect-timeout 5 -sI "$line" | head -1 | awk '{print $2}')
  then
    if [[ "x$status" = "x" ]]
    then
      echo " === === $line"
    elif [[ "$status" = 200 ]]
    then
      echo " +++ $status $line"
    else
      echo " --- $status $line"
    fi
  else
    echo " @@@ @@@ $line"
  fi
done
