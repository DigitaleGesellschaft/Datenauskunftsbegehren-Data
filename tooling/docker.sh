#!/usr/bin/env bash
set -euo pipefail

CMD="${1:-}"

case "$CMD" in
  build)
    docker run --rm -it \
      -v "$(pwd)/../:/app" \
      -w /app \
      node:24-alpine \
      sh -c "npm install && npm run compile"
    ;;
  lint)
    docker run --rm -it \
      -v "$(pwd)/../:/app" \
      -w /app \
      node:24-alpine \
      sh -c "npm install && npm run lint"
    ;;
  test)
    docker run --rm -it \
      -v "$(pwd)/../:/app" \
      -w /app \
      node:24-alpine \
      sh -c "npm install && npm run lint-ci && npm run test"
    ;;
  *)
    echo "Usage: $0 {build|test|lint}"
    exit 1
    ;;
esac
