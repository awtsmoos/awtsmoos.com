# Awtsmoos Tunnel — API Reference (for AI agents)

You are an AI agent acting with the tunnel owner's credentials. This document
gives you exact, copy-pasteable recipes for installing headless, completing
device login programmatically, minting and redeeming connect links, and making
authenticated control calls.

Conventions:

- Base URL: `https://awtsmoos.com`
- Auth for control endpoints: header `x-awtsmoos-api-key: <key>`
- All request bodies are JSON; send `Content-Type: application/json`.
- Only the endpoints below exist — do not guess others.

---

## Recipe A — install headless (fastest)

```bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash -s -- --agent-only -y --no-login
```

- `--agent-only`: agent + registration only; needs system Node.js 18+; no
  browser, no recovery lanes. (`--minimal` for agent + registration with no
  browser auto-open; default `--full` brings its own runtime.)
- `-y`: skip the interactive menu. `--no-login`: skip the device-login card.
- Ctrl+C cancels cleanly (exit 130, nothing half-installed).

---

## Recipe B — device login, programmatically (poll loop)

The device flow mints a user code the owner approves on their phone. Steps:

1. `POST /api/tunnel/control/device-login/code` with
   `{tunnelId, deviceId, deviceName}` → **201**
   `{ok, userCode, deviceCode, verificationUrl, verificationUrlWithCode, expiresIn, interval}`.
2. Show the owner `verificationUrlWithCode` and `userCode` (format `ABCD-1234`,
   10-minute TTL, single-use).
3. Poll `POST /api/tunnel/control/device-login/status` with `{deviceCode}`
   every `interval` seconds until `status` is `approved`, `denied`, or
   `expired`. On `slow_down`, back off. Stop polling when `expiresIn` elapses.
4. On `approved`, the response also carries `apiKey`, `keyId`, `accountId` —
   save them with mode 600.

```bash
#!/usr/bin/env bash
# Device-login: mint code, poll until the owner approves. Needs python3.
set -u
BASE="https://awtsmoos.com"
TUNNEL_ID="my-gpu-box"       # your tunnel id
DEVICE_ID="gpu-01"           # stable id for this machine
DEVICE_NAME="GPU box 01"     # human label

resp=$(curl -fsSL -X POST "$BASE/api/tunnel/control/device-login/code" \
  -H 'Content-Type: application/json' \
  -d "$(python3 -c 'import json,sys;print(json.dumps({"tunnelId":sys.argv[1],"deviceId":sys.argv[2],"deviceName":sys.argv[3]}))' \
        "$TUNNEL_ID" "$DEVICE_ID" "$DEVICE_NAME")")
# → 201 {ok, userCode, deviceCode, verificationUrl, verificationUrlWithCode, expiresIn, interval}

eval "$(python3 - "$resp" <<'EOF'
import json,sys,shlex
d=json.loads(sys.argv[1])
for k in ("userCode","deviceCode","verificationUrlWithCode","expiresIn","interval"):
    print(f"{k.upper()}={shlex.quote(str(d.get(k,'')))}")
EOF
)"

echo "Owner: open $VERIFICATIONURLWITHCODE and enter code $USERCODE"

interval=${INTERVAL:-5}
deadline=$(( $(date +%s) + ${EXPIRESIN:-600} ))
while [ "$(date +%s)" -lt "$deadline" ]; do
  sleep "$interval"
  st=$(curl -fsSL -X POST "$BASE/api/tunnel/control/device-login/status" \
    -H 'Content-Type: application/json' \
    -d "$(python3 -c 'import json,sys;print(json.dumps({"deviceCode":sys.argv[1]}))' "$DEVICECODE")")
  status=$(python3 -c 'import json,sys;print(json.loads(sys.stdin.read()).get("status",""))' <<<"$st")
  case "$status" in
    approved)
      umask 077
      mkdir -p "$HOME/.awtsmoos-tunnel"
      python3 - "$st" <<'EOF' > "$HOME/.awtsmoos-tunnel/credentials.json"
import json,sys
d=json.loads(sys.stdin.read())
json.dump({"apiKey":d.get("apiKey"),"keyId":d.get("keyId"),"accountId":d.get("accountId")},sys.stdout,indent=2)
EOF
      chmod 600 "$HOME/.awtsmoos-tunnel/credentials.json"
      echo "approved; credentials saved (mode 600)"
      exit 0 ;;
    denied)   echo "owner denied the request" >&2; exit 3 ;;
    expired)  echo "code expired; mint a fresh one" >&2; exit 4 ;;
    slow_down)
      interval=$(( interval * 2 ))
      echo "server asked to slow down; now polling every ${interval}s" >&2 ;;
    pending)  : ;;
    *) echo "unexpected status: $status" >&2 ;;
  esac
done
echo "timed out waiting for approval" >&2
exit 5
```

Note: this loop prints only the URL and code — never the API key.

---

## Recipe C — mint a connect link (owner only)

```bash
KEY=$(node -e 'process.stdout.write(JSON.parse(require("fs").readFileSync(process.env.HOME+"/.awtsmoos-tunnel/credentials.json","utf8")).apiKey)')
curl -fsSL -X POST https://awtsmoos.com/api/tunnel/control/external-agent/invite/create \
  -H 'Content-Type: application/json' \
  -H "x-awtsmoos-api-key: $KEY" \
  -d '{"label":"research agent session"}'
# → { "url": "https://awtsmoos.com/tunnel/connect?code=XXXXXXXXXXXX", ... }
unset KEY
```

Hand the returned `url` to the other agent. The link is single-use and dies on
use.

---

## Recipe D — redeem an invite as a new agent

You received a connect link like
`https://awtsmoos.com/tunnel/connect?code=XXXXXXXXXXXX`.

```bash
CODE="XXXXXXXXXXXX"   # from the link the owner gave you

# 1. (optional) confirm the invite is valid — exact response shape unverified
curl -fsSL "https://awtsmoos.com/api/tunnel/control/external-agent/invite/describe?code=$CODE"

# 2. redeem as a named agent → scoped API key
curl -fsSL -X POST https://awtsmoos.com/api/tunnel/control/external-agent/invite/redeem \
  -H 'Content-Type: application/json' \
  -d "$(python3 -c 'import json,sys;print(json.dumps({"code":sys.argv[1],"agentName":sys.argv[2]}))' "$CODE" "research-agent-01")"
# → 200 with your scoped API key. Store the key material from the response
#   (exact field set unverified) — mode 600, never print it to logs.
```

The invite dies on redeem; a redeemed or expired code returns an error.

---

## Recipe E — authenticated API calls

```bash
KEY=$(node -e 'process.stdout.write(JSON.parse(require("fs").readFileSync(process.env.HOME+"/.awtsmoos-tunnel/credentials.json","utf8")).apiKey)')
curl -fsSL https://awtsmoos.com/api/tunnel/control/me \
  -H "x-awtsmoos-api-key: $KEY"
unset KEY
```

- `GET /api/tunnel/control/me` is the smoke test: if your key is valid you get
  your account/device identity back (exact shape unverified); a bad key fails
  auth.
- Never run with `set -x` while the key is in scope, and never paste the key
  into chat, logs, or tickets.

---

## Endpoint table

| Method | Endpoint | Auth | Request | Response | Notes |
|---|---|---|---|---|---|
| `GET` | `/api/tunnel/install/unix` | none | — | shell script (text) | the installer one-liner target |
| `POST` | `/api/tunnel/control/device-login/code` | none | `{tunnelId, deviceId, deviceName}` | **201** `{ok, userCode, deviceCode, verificationUrl, verificationUrlWithCode, expiresIn, interval}` | `userCode` like `ABCD-1234`; 10-min TTL; single-use |
| `POST` | `/api/tunnel/control/device-login/status` | none | `{deviceCode}` | **200** `{status: pending\|approved\|denied\|expired\|slow_down, apiKey?, keyId?, accountId?}`; **404** unknown code | `apiKey` etc. only when `approved` |
| `POST` | `/api/tunnel/control/device-login/describe` | owner session | unverified | unverified | phone side — powers `GET /tunnel/device` |
| `POST` | `/api/tunnel/control/device-login/approve` | owner session | unverified | unverified | phone side — approves the device |
| `POST` | `/api/tunnel/control/device-login/deny` | owner session | unverified | unverified | phone side — denies the device |
| `GET` | `/tunnel/device` | owner session (browser) | `?code=ABCD-1234` | HTML approval page | owner opens the card URL here |
| `POST` | `/api/tunnel/control/external-agent/invite/create` | `x-awtsmoos-api-key` | `{label}` | `{url: "https://awtsmoos.com/tunnel/connect?code=..."}` (+ other fields unverified) | single-use link |
| `GET` | `/api/tunnel/control/external-agent/invite/describe` | none (code is the secret) | `?code=…` | invite metadata (shape unverified) | check validity before redeeming |
| `POST` | `/api/tunnel/control/external-agent/invite/redeem` | none (code is the secret) | `{code, agentName}` | **200** with scoped API key (exact field set unverified) | link dies on use |
| `GET` | `/tunnel/connect` | none (code in URL) | `?code=…` | HTML connect page | human/agent connect entry point |
| `GET` | `/api/tunnel/control/me` | `x-awtsmoos-api-key` | — | identity payload (shape unverified) | smoke-test for key validity |

---

## Error codes — what each means and what to do

| Code | Meaning | Do this |
|---|---|---|
| **400** | Bad request: malformed JSON, missing/wrong fields | Fix the payload; do not retry unchanged |
| **404** | Unknown code (`deviceCode` / invite code): never existed, expired, or already used | Mint a fresh code; do not retry the old one |
| **429** / `slow_down` | Rate-limited / politely asked to back off | Double your poll interval and keep waiting; never hammer |
| **5xx** | Server-side failure | Retry with backoff a few times, then surface the failure |

General rules: 4xx means *your* request is wrong — fix it, don't retry.
`slow_down` is not an error, it's pacing — honor it. Device-login codes are
cheap to re-mint; prefer a fresh code over aggressive polling of a dying one.

---

## Polling & rate-limit etiquette

1. Poll `device-login/status` at the `interval` (seconds) returned by the code
   request — never faster.
2. On `slow_down`, double the interval and continue.
3. Stop polling when `status` is `approved`, `denied`, or `expired` — and in any
   case when `expiresIn` seconds have elapsed. Never poll a dead code.
4. Login is best-effort by design: a missed or expired login never fails the
   install — mint a new code instead of looping forever.

---

## Credential storage rules

- Save API keys to `~/.awtsmoos-tunnel/credentials.json` with file mode **600**
  (exactly what the installer does).
- **Never log keys**: don't print the status/redeem response body, don't
  `echo $KEY`, don't run `set -x` while a key is in scope.
- Load the key transiently (env var or process substitution), `unset` it after
  use.
- Never commit keys to git, never paste them into chat, tickets, or screenshots.
- Treat `deviceCode` values as short-lived secrets and invite codes as
  single-use bearer tokens.

---

*Human-facing install walkthrough, modes, the phone card flow, and per-failure
troubleshooting: see `TUNNEL_INSTALL_GUIDE.md` in this folder.*
