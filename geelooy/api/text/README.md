# B"H — Text / Timestamp API (geelooy/api/text/)

Media timestamp/transcription jobs: submit a job keyed by API key + media URL,
then poll for the result.

## Contents
- `_awtsmoos.derech.js` — routes: `timestamp`, `timestamp/:jobId`,
  `timestamp/:jobId/result`.
- `DOCUMENTATION.md` — health docs; notes this mount carries a known syntax
  defect (see `docs/GENERATED/DERECH_HEALTH.md` for the generated evidence).

## Endpoints
- `timestamp` — submit a transcription job (`apiKey` + `mediaURL` required).
- `timestamp/:jobId` — job status.
- `timestamp/:jobId/result` — job result.

## Caveat
The mount is intentionally kept visible with its syntax defect so intended
routes are not mistaken for verified ones — check the DERECH_HEALTH evidence
before relying on these endpoints.
