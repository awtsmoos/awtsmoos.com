# Awtsmoos Tunnel — Install & Operator Guide

The tunnel connects one of your machines to your Awtsmoos account so you (and
AI agents you approve) can reach that machine from anywhere — including from a
machine with no browser, no display, and no keyboard.

This guide supersedes `HEADLESS_GPU_SETUP.md` (kept in this folder for
reference). Everything in it is covered below.

---

## Quick start

```bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash
```

An interactive menu walks you through the rest. Press **Ctrl+C** at any point
to cancel cleanly — the installer exits with code 130 and leaves nothing
half-installed.

---

## Pick a mode

| Mode | What you get | Needs |
|---|---|---|
| `--full` (default) | Complete tunnel: agent, guardian, recovery lanes, browser support | Nothing extra |
| `--minimal` | Agent + registration, no browser auto-open | System Node.js 18+ |
| `--agent-only` | Fastest headless install: agent + registration only | System Node.js 18+ |

Run any mode non-interactively with `-y` (for example on a remote box):

```bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash -s -- --agent-only -y
```

### All installer options

| Flag | Effect |
|---|---|
| `--full` | Complete tunnel (default) |
| `--minimal` | Agent + registration; uses your system Node.js 18+; no browser auto-open |
| `--agent-only` | Fastest headless install; no browser, no recovery lanes |
| `--mode=MODE` | Same as `--MODE` (`full`, `minimal`, `agent-only`) |
| `-y`, `--yes` | Skip the interactive menu; install with the default/flag mode |
| `--no-login` | Skip the headless device-login step |
| `-h`, `--help` | Show the built-in help |

The installer shows dual progress bars (overall + per-step), prints a specific
error card — **what** happened, **why**, the **fix**, and the **log** path — on
every failure, and guards long steps with timeouts. Piped/non-TTY runs get
clean plain-text lines instead of the fancy UI.

---

## Log in this machine (the device-login card)

At the end of the install the machine prints a gold card like this:

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

1. On your phone — signed in as the tunnel owner — open the URL, check the
   device name, and tap **Approve & connect**.
2. The installer sees the approval within seconds and finishes.
3. Credentials land in `~/.awtsmoos-tunnel/credentials.json` (**mode 600**,
   never shown again) and `device-binding.json` is updated. The box is now
   bound to your account.

Rules of the card:

- The code looks like `ABCD-1234`, **expires in 10 minutes**, and is
  **single-use**.
- **Ctrl+C skips login** any time — the tunnel still installs and works; rerun
  the installer to retry login later.
- `--no-login` skips this step entirely.
- Login is best-effort by design: it can never fail the install.

---

## Let other AI agents connect

The owner mints a single-use connect link. Do it from any machine that already
holds your tunnel credentials:

```bash
curl -X POST https://awtsmoos.com/api/tunnel/control/external-agent/invite/create \
  -H 'Content-Type: application/json' \
  -H "x-awtsmoos-api-key: $(node -e 'process.stdout.write(JSON.parse(require("fs").readFileSync(process.env.HOME+"/.awtsmoos-tunnel/credentials.json","utf8")).apiKey)')" \
  -d '{"label":"Claude research session"}'
# → { "url": "https://awtsmoos.com/tunnel/connect?code=XXXXXXXXXXXX", ... }
```

Hand that link to any AI agent. It opens the link (headless agents: `GET`
`.../invite/describe?code=…`, then `POST .../invite/redeem {"code","agentName"}`)
and presses **Connect** to receive one scoped API key. The link dies on use.

(For the exact API shapes, see `TUNNEL_API_REFERENCE.md` in this folder.)

---

## Rented GPU box walkthrough (headless, no browser)

This is the standard way to put a rented GPU box (or any headless server) on
your tunnel. No browser needed anywhere on the box.

**1. Install**

```bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash -s -- --agent-only -y
```

`--agent-only` = tunnel agent + registration, no browser, no recovery lanes,
uses the box's system Node.js 18+. (`--minimal` also works if you want the
fuller agent; `--no-login` skips step 2.)

**2. Log in with no browser (device flow)**

The box prints the gold card from the section above. On your phone, open the
URL, check the device name, tap **Approve & connect**. The installer finishes;
credentials land in `~/.awtsmoos-tunnel/credentials.json` (mode 600).

The code expires in 10 minutes and works once. Ctrl+C skips login any time —
the tunnel still installs and works; rerun the installer to retry login.

**3. Let other AI agents connect to this box**

Mint a connect link exactly as in "Let other AI agents connect" above and hand
it to the agent. It presses **Connect** (or redeems headless) and gets one
scoped API key.

**The whole chain, conceptually**

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

---

## Troubleshooting — one failure, one fix

### Install fails partway

The installer prints an error card: what happened, why, the exact fix, and the
install JSONL log path (printed on failure — read it first). Follow the card,
then rerun. For a clean reinstall:

```bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | AWTSMOOS_RESTART=1 bash
```

### I pressed Ctrl+C during install

Expected behavior: exit 130, clean cancel, nothing half-installed. Just rerun
the installer when ready.

### Login code expired

Codes live 10 minutes and are single-use. Rerun the installer; a fresh code is
minted. Nothing else needs to change.

### I tapped Deny (or approved the wrong device)

Rerun the installer for a fresh code, then approve carefully — check the device
name on the phone screen matches the box you're installing.

### I skipped login (--no-login, or Ctrl+C at the card)

The tunnel installs and runs, but it isn't bound to your account. Rerun the
installer (without `--no-login`) to do the login step.

### No system Node.js 18+ (`--minimal` / `--agent-only` complain)

Those two modes use the box's own Node. Either install Node.js 18+ first, or
drop the flag and run the default `--full` install, which brings its own
runtime.

### The card waits forever — approval never arrives

The installer polls the server; if the code expired mid-wait it can't succeed.
Open the URL while signed in **as the tunnel owner** (approving from a
different account won't bind your box), and if in doubt, rerun the installer
for a fresh code.

### The tunnel was fine, now something's off

Durable local repair (no reinstall):

```bash
~/.awtsmoos-tunnel/awtsmoos-tunnel-service.sh repair
```

### Nothing helps / weird state

Universal self-healing reinstall or upgrade:

```bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | AWTSMOOS_RESTART=1 bash
```

---

## FAQ

**What is the tunnel, in one sentence?**
A small agent on your machine that ties it to your Awtsmoos account so you and
agents you approve can reach it remotely.

**Do I need a browser on the box?**
No. Use `--minimal` or `--agent-only`, and log in via the phone card.

**Where do my credentials live?**
`~/.awtsmoos-tunnel/credentials.json` (file mode 600 — only you can read it),
plus `device-binding.json` in the same directory. Never paste the API key into
chat, logs, or tickets.

**Can I install on a rented GPU box with no display?**
Yes — that's exactly the walkthrough above.

**How do other AI agents get access?**
You mint a single-use connect link and hand it to them; they connect and get
one scoped API key.

**How long is a login code valid?**
10 minutes, single-use.

**What if the installer fails?**
Read the on-screen error card (what / why / fix / log path), fix what it says,
rerun. `AWTSMOOS_RESTART=1` forces a clean reinstall.

**Does the installer need root?**
Unverified — the installer keeps everything under `~/.awtsmoos-tunnel`, so
elevation is not expected to be required; the failure card will say so if a
step needs it.

---

## Repair, reinstall, uninstall

| Need | Command |
|---|---|
| Repair in place | `~/.awtsmoos-tunnel/awtsmoos-tunnel-service.sh repair` |
| Clean reinstall / upgrade | `curl -fsSL https://awtsmoos.com/api/tunnel/install/unix \| AWTSMOOS_RESTART=1 bash` |
| Uninstall | No one-step uninstaller is documented (unverified). The tunnel's state lives under `~/.awtsmoos-tunnel/`; check `~/.awtsmoos-tunnel/awtsmoos-tunnel-service.sh` for its supported commands before removing anything. |

---

*Machine-readable version of the login/invite flow (exact curl, poll loops,
endpoint table, error codes): see `TUNNEL_API_REFERENCE.md` in this folder.*
