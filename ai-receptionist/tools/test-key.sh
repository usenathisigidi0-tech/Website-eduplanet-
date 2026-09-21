#!/usr/bin/env bash
# Rule 7 step 3: test a platform key with one cheap, read-only API call.
# Usage: tools/test-key.sh [platform]
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f .env ] || { echo "no .env found — copy .env.example and fill it in"; exit 1; }
set -a; . ./.env; set +a

case "${1:-retell}" in
  retell)
    : "${RETELL_API_KEY:?RETELL_API_KEY not set in .env}"
    # POST is correct here: Retell v2 uses POST for list operations. This is a
    # read — it lists agents. Never test with /v2/create-phone-call, which
    # places a real billed call.
    echo "POST https://api.retellai.com/v2/list-agents?limit=1"
    curl -sS -w '\nHTTP %{http_code}\n' \
      -X POST 'https://api.retellai.com/v2/list-agents?limit=1' \
      -H "Authorization: Bearer $RETELL_API_KEY" \
      -H 'Content-Type: application/json' \
      -d '{}'
    ;;
  *) echo "unknown platform: $1"; exit 1 ;;
esac
