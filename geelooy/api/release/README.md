# B"H — Release Identity API (geelooy/api/release/)

Reports the identity of the loaded service release — the release is named by
the running process, never merely the Git directory.

## Contents
- `_awtsmoos.derech.js` — whole API: route `/`.

## Endpoint
- `GET /` — returns `{ok, releaseSha, evidence: "running_process_environment"}`
  where `releaseSha` is `AWTSMOOS_RELEASE_SHA` only if it is a valid 40-char
  hex SHA (HTTP 200), otherwise 503 with an empty SHA. `Cache-Control: no-store`.
