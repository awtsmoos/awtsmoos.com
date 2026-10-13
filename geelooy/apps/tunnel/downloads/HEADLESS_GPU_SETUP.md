# B"H — Headless GPU box: install, log in, let other AI agents connect

Yaakov 2026-10-12. No browser needed anywhere on the box.

## 1. Install on the rented GPU box

```bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash -s -- --agent-only -y
```

`--agent-only` = fastest headless install: tunnel agent + registration, no browser,
no recovery lanes, uses the box's system Node.js 18+.
(`--minimal` also works if you want the fuller agent; `--no-login` skips step 2.)

## 2. Log in with no browser (device flow)

At the end of the install the box prints:

```
╭──────────────────────────────────────────────╮
│  🔑  LOG IN THIS MACHINE                     │
│  On your phone, open:                        │
│     https://awtsmoos.com/tunnel/device?code=ABCD-1234
│  and enter this code:                        │
│         ABCD-1234
│  Tap Approve. This screen waits for you.     │
╰──────────────────────────────────────────────╯
```

On your phone (signed in as the tunnel owner) open the URL, check the device
name, tap **Approve & connect**. The installer sees the approval within seconds
and finishes. Credentials land in `~/.awtsmoos-tunnel/credentials.json`
(mode 600, never shown again) and the box is bound to your account.

The code expires in 10 minutes and works once. Ctrl+C skips login any time —
the tunnel still installs and works; run the installer again to retry login.

## 3. Let other AI agents connect to this box

The owner mints a single-use connect link (on the phone, or with the box's key):

```bash
# on the GPU box, using the key from step 2
curl -X POST https://awtsmoos.com/api/tunnel/control/external-agent/invite/create \
  -H 'Content-Type: application/json' \
  -H "x-awtsmoos-api-key: $(node -e 'process.stdout.write(JSON.parse(require("fs").readFileSync(process.env.HOME+"/.awtsmoos-tunnel/credentials.json","utf8")).apiKey)')" \
  -d '{"label":"Claude research session"}'
# → { "url": "https://awtsmoos.com/tunnel/connect?code=XXXXXXXXXXXX", ... }
```

Hand that link to any AI agent (ChatGPT, Claude, anything). It opens the link
(or, headless: `GET .../invite/describe?code=…` then
`POST .../invite/redeem {"code","agentName"}`), presses **Connect**, and gets one
scoped API key. The link dies on use and expires within hours.

## The whole chain, conceptually

```
GPU box (no browser)                your phone                    other AI agent
─────────────────                   ──────────                    ──────────────
installer --agent-only ─┐
prints code + URL ──────┼──► you open URL, tap Approve ─┐
polls until approved ◄──┘                                │
box bound to your account                               │
owner mints connect link ───────────────────────────────┼──► agent opens link,
                                                        │    presses Connect
                                                        │    → scoped API key
                                                        │    → talks to the box
```

## Troubleshooting

- **No system Node 18+**: install Node.js 18+ first, or drop `--agent-only` for
  the full install (it brings its own runtime).
- **Code expired**: run the installer again; a fresh code is minted.
- **Denied by mistake**: run the installer again.
- Server endpoints: `POST /api/tunnel/control/device-login/code`,
  `POST /api/tunnel/control/device-login/status`,
  `POST /api/tunnel/control/device-login/describe|approve|deny`.
