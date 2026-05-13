#!/bin/bash
# To exclude *.fr.yml:
# GLOBIGNORE=*.fr.yml

# Output format
# OK? EXPLANATION URL
#
# The "OK? EXPLANATION" parts may contain the following information
#
# Relatively raw messages
# - "OK  200": OK
# - ">>> 3xx": Redirect
# - "ERR 4xx" or "ERR 5xx": Errors
# - "ERR CONNECT": Connection error or timeout
# 
# Decoded errors
# - "??? <Name of CDN>": The CDN blocks the curl requests; check in the browser
# - "!!! <Name of CDN>": The CDN blocks the curl requests; check in the browser
# - The difference between the "???" and "!!!" versions are, that when the CDN
#   returns errors from more than one of 3xx, 4xx, or 5xx ranges, the lower range
#   will show "???", the higher one "!!!". There is probably no difference between
#   the two from our point of view; the CDN customer just configured it differently.
#
# To verify what the server returns (status+headers), run `curl -sI <URL>`
# (quote the URL if it contains shell metacharacters).

tmp=$(mktemp -d)

sed -e '/#/d' -e '/https:/!d' -e 's/.*\(https:\)/\1/' ../data/orgs/*.yml | sort -u | while read line
do
  # Sanitize URL and limit length for filesystem compatibility
  san=$(echo "$line" | tr -c 'A-Za-z0-9' _ | head -c 200)
  if curl --connect-timeout 5 --max-time 10 -sI "$line" > "$tmp/$san"
  then
    # Skip over early HTTP/2 103 status
    if head -1 "$tmp/$san" | grep "^HTTP/2 103" > /dev/null
    then
      status=$(grep "^HTTP/2 " "$tmp/$san" | tail -1 | awk '{print $2}')
    else
      status=$(head -1 "$tmp/$san" | awk '{print $2}')
    fi

### No response

    if [[ "x$status" = "x" ]]
    then
      echo "ERR NORESPONSE $line"

### 200

    elif [[ "$status" = 200 ]]
    then
      echo "OK  $status        $line"

### 403/404/405 CDN

    elif [[ "$status" = 403 || "$status" = 404 || "$status" = 405 ]]
    then
      # Test for CDNs. Most return 403, including most CloudFront/CloudFlare requests
      # - (OBI|KIA)+CloudFront combo is 404
      # - Starbucks+CloudFlare combo is 405
      if grep -i "^server: cloudflare" "$tmp/$san" > /dev/null
      then
        echo "??? CLOUDFLARE $line"
      elif grep -i "^X-DataDome: protected" "$tmp/$san" > /dev/null
      then
        echo "??? DATADOME   $line"
      elif egrep -i "^akamai-grn:|^server: AkamaiGhost|^Akamai-Request-BC:" "$tmp/$san" > /dev/null
      then
        echo "??? AKAMAI     $line"
      elif grep -i "^x-cdn: Imperva" "$tmp/$san" > /dev/null
      then
        echo "??? IMPERVA    $line"
      elif grep -i "^x-cache: Error from cloudfront" "$tmp/$san" > /dev/null
      then
        # Alternatively, could check for "Via:" with cloudfront.net
        echo "??? CLOUDFRONT $line"
      else
        echo "ERR $status        $line"
      fi

### 3xx including CDN Imperva and Landi

    elif [[ "$status" -ge 300 && "$status" -lt 400 ]]
    then
      # Check for Allianz/Imperva "I don't like you, I don't serve you" redirect
      if [[ "$status" = 303 ]] && grep -i 'Location: /error_path/400.html.al_req_id=' "$tmp/$san" > /dev/null
      then
        echo "??? IMPERVA    $line"
      # Check for Landi "I don't like you, I don't serve you" redirect
      elif [[ "$status" = 302 ]] && grep -i 'Location: http://offline.landi.ch' "$tmp/$san" > /dev/null
      then
        echo "??? LANDI      $line"
      # Tagi redirects to itself, probably checking for cookie on the second request
      elif [[ "$status" = 302 ]] && grep -i 'Location: $line' "$tmp/$san" > /dev/null
      then
        echo "??? TAGI       $line"
      else
        echo ">>> $status        $line"
      fi

### 500 CloudFlare

    elif [[ "$status" = 500 ]] && grep -i "^server: cloudflare" "$tmp/$san" > /dev/null
    then
       # Cloudflare speculation (see "Speculation-Rules:" header)
       echo "!!! CLOUDFLARE $line"

### 500 CloudFlare

    elif [[ "$status" = 503 ]] && grep -i "^akamai-grn:" "$tmp/$san" > /dev/null
    then
       echo "!!! AKAMAI     $line"

### Everything else

    else
      echo "ERR $status        $line"
    fi

### Non-success return code for curl, most likely connection error

  else
    echo "ERR CONNECT    $line"
  fi
done

rm -r "$tmp"
