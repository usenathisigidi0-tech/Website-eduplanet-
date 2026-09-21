# Retell — voice platform

Last verified: 2026-09-21
Status in this session: **REST API unreachable — `api.retellai.com` and
`docs.retellai.com` are both blocked by the sandbox egress proxy.** Details
below come from vendor documentation via search, not from live calls.

## Auth
- Base URL: `https://api.retellai.com`
- Header: `Authorization: Bearer $RETELL_API_KEY`
- `Content-Type: application/json` on POSTs.
- Keys are `key_...`. Ours is in `.env` as `RETELL_API_KEY`.

## Endpoints
Retell's current surface is **v2** and uses **POST for list operations** — a
POST to `list-*` is still a read; the body carries filter criteria.

| Op | Method | Path |
|---|---|---|
| List agents | POST | `/v2/list-agents?limit=50` |
| Create agent | POST | `/v2/create-agent` |
| List calls | POST | `/v2/list-calls` |
| Create phone call (outbound) | POST | `/v2/create-phone-call` |
| Buy / bind phone number | POST | `/v2/create-phone-number` |

List params: `limit` (default 50, max 1000), `sort_order`, `pagination_key`
for the next page. `list-agents` takes a `filter_criteria` body, e.g.
`{"filter_criteria":{"channel":{"op":"eq","value":"voice"}}}`.
`list-calls` filters on `agent_id`, `call_type`
(`INBOUND_PHONE_CALL` / `OUTBOUND_PHONE_CALL`) and timestamp ranges.

## Gotchas
- **Do not assume `GET /list-agents`.** That older v1 shape is what an
  out-of-date model will reach for; the live API is `POST /v2/list-agents`.
- `/v2/create-phone-call` **places a real outbound call and costs money** —
  never use it as a connectivity test. Use `/v2/list-agents` for that.
- A phone number must be bound to an agent for inbound calls to route.
- Agent config is versioned (`override_agent_version`), so a deploy can pin
  a version rather than tracking latest.

## Test call (rule 7 step 3)
`tools/test-key.sh retell` — POSTs `/v2/list-agents?limit=1`. Read-only,
free, and does not dial anyone.

## Sources
- https://docs.retellai.com/api-references/list-agents
- https://docs.retellai.com/api-references/create-phone-call
