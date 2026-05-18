# B"H Awtsmoos AI Relay

A tiny local Node.js relay for `geelooy/ai` when the Awtsmoos Chrome server extension is not available or not injected yet.

## Run

```bash
node awtsmoos-ai-relay.mjs
```

Default health URL:

```text
http://127.0.0.1:3847/health
```

## macOS / Linux quick install

```bash
mkdir -p ~/.awtsmoos-ai-relay
curl -L https://awtsmoos.com/scripts/tricks/ai-relay/awtsmoos-ai-relay.mjs -o ~/.awtsmoos-ai-relay/awtsmoos-ai-relay.mjs
node ~/.awtsmoos-ai-relay/awtsmoos-ai-relay.mjs
```

## Windows quick run

```powershell
mkdir $env:USERPROFILE\.awtsmoos-ai-relay -Force
curl.exe -L https://awtsmoos.com/scripts/tricks/ai-relay/awtsmoos-ai-relay.mjs -o $env:USERPROFILE\.awtsmoos-ai-relay\awtsmoos-ai-relay.mjs
node $env:USERPROFILE\.awtsmoos-ai-relay\awtsmoos-ai-relay.mjs
```

## Environment

```bash
AWTSMOOS_AI_RELAY_PORT=3847 node awtsmoos-ai-relay.mjs
```

The relay keeps an in-memory cookie jar per upstream origin and streams upstream response bodies back to the browser.
