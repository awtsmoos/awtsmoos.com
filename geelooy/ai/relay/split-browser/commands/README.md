B"H

# Authentication, Capability, and Stress Commands

Manual login only:

```bash
npm run ai:login
```

A dedicated visible Chrome profile opens. Sign in manually. The command synchronizes the saved session through local browser-level DevTools, detects the redacted authenticated verdict, and closes Chrome automatically.

Request-only capability only:

```bash
npm run ai:request-capability
```

This command opens an authenticated `/settings` host and runs paced official prepare and Sentinel SDK calls. It does not touch the composer or send a conversation POST. The report distinguishes request-available values from the normal browser-challenge boundary without persisting any secret value.

Login plus strict stress verification:

```bash
npm run ai:login-stress
```

The strict stress command never switches automatically to the carrier fallback. When active enforcement is present, it reports `direct_enforcement_required` safely.

Optional environment variables:

- `AWTSMOOS_CHROME_DEBUG_PORT`
- `AWTSMOOS_LOGIN_TIMEOUT_MS`
- `AWTSMOOS_LOGIN_POLL_MS`
- `AWTSMOOS_STRESS_CONVERSATIONS`
- `AWTSMOOS_STRESS_MESSAGES`
- `AWTSMOOS_DIRECT_INTERVAL_MS` — values below 10000 are raised to 10000 for real stress requests.
