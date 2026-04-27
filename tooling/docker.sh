#!/usr/bin/env bash
set -euo pipefail

CMD="${1:-}"

case "$CMD" in
  yamllint)
    docker run --rm -it \
      -v "$(pwd)/../:/data" \
      cytopia/yamllint \
      -c /data/.github/workflows/yamlconfig /data
    ;;
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
    echo "Usage: $0 {yamllint|build|lint|test}"
    exit 1
    ;;
esac