B"H

# ChatGPT Website Commands

The relay uses only the authenticated ChatGPT website. There is no local model,
local inference server, API key, or alternate provider.

## Manual login

```bash
npm run ai:login
```

A normal visible ChatGPT window opens. Sign in manually. The command detects the
redacted authenticated status, saves the browser profile, and closes the login
window. It never types credentials or clicks login controls.

## Website capability

```bash
npm run ai:web-capability
```

This checks whether the dedicated profile is authenticated. It does not send a
conversation message.

## Website stress

```bash
npm run ai:website-stress
```

The stress runner creates and continues ChatGPT website conversations sequentially,
with one global minimum ten-second interval between turn starts. Every real prompt
enters the ordinary ChatGPT composer and uses the site's own send control.

## Optional environment variables

- `AWTSMOOS_STRESS_CONVERSATIONS`
- `AWTSMOOS_STRESS_MESSAGES`
- `AWTSMOOS_DIRECT_INTERVAL_MS` — values below 10000 are raised to 10000.
- `AWTSMOOS_CHROME_DEBUG_PORT`
- `AWTSMOOS_LOGIN_TIMEOUT_MS`
- `AWTSMOOS_LOGIN_POLL_MS`
