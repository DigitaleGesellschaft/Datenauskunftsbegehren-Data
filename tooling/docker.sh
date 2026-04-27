#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

CMD="${1:-}"

case "$CMD" in
  yamllint)
    docker run --rm -it \
      -v "$PROJECT_ROOT/:/data" \
      cytopia/yamllint \
      -c /data/.github/workflows/yamlconfig /data
    ;;
  build)
    docker run --rm -it \
      -v "$PROJECT_ROOT/:/app" \
      -w /app \
      node:24-alpine \
      sh -c "npm install && npm run compile"
    ;;
  lint)
    docker run --rm -it \
      -v "$PROJECT_ROOT/:/app" \
      -w /app \
      node:24-alpine \
      sh -c "npm install && npm run lint"
    ;;
  test)
    docker run --rm -it \
      -v "$PROJECT_ROOT/:/app" \
      -w /app \
      node:24-alpine \
      sh -c "npm install && npm run lint-ci && npm run test"
    ;;
  *)
    echo "Usage: $0 {yamllint|build|lint|test}"
    exit 1
    ;;
esac