B"H

# Request-Only, Authentication, and Stress Commands

## Fully request-only mode

Configure the official API credential in the server shell:

```bash
export OPENAI_API_KEY="your_api_key_here"
export OPENAI_MODEL="gpt-5.2"
```

Configuration-only check—no Chrome, DOM, or provider request:

```bash
npm run ai:request-capability
```

Four chains × five messages, native HTTP only:

```bash
npm run ai:request-only-stress
```

The request-only stress command requires `OPENAI_API_KEY`, uses the official Responses API, enforces a global ten-second minimum interval, and writes a redacted report. It does not create ChatGPT website-sidebar conversations.

## Website diagnostics and fallback

Manual ChatGPT website login:

```bash
npm run ai:login
```

Read-only website enforcement diagnostic:

```bash
npm run ai:web-capability
```

Explicit browser-authorized fallback stress:

```bash
npm run ai:fallback-stress
```

The website fallback is separate and never selected automatically by strict request-only mode.

## Optional environment variables

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `AWTSMOOS_STRESS_CONVERSATIONS`
- `AWTSMOOS_STRESS_MESSAGES`
- `AWTSMOOS_DIRECT_INTERVAL_MS` — values below 10000 are raised to 10000.
- `AWTSMOOS_CHROME_DEBUG_PORT` — website diagnostics and fallback only.
- `AWTSMOOS_LOGIN_TIMEOUT_MS`
- `AWTSMOOS_LOGIN_POLL_MS`
