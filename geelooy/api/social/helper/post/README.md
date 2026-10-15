# B"H — Post (geelooy/api/social/helper/post/)

Post/series read and submission helpers for the social API.

## Files
- `index.js` — module entry.
- `seriesRecordReader.js`, `seriesReadCache.js`, `seriesReadCompatibility.js` — series record reads with caching and compatibility shims.
- `meluketSeriesMap.js`, `seriesKeyCompleteness.js` — Meluket series mapping and series-key completeness checks.
- `submissions.js` — post submissions (review workflow).
- `test/` — submission fixture, submission review convergence, series-key completeness, series-read compatibility (incl. singular and single-enumeration), `postSubmissionFixture.js`.

## Routes (examples)
- `/social/heichelos/h1/editors`, `/social/heichelos/h1/moderators`, `/social/heichelos/h1/settings/submissions`
- `/ownership`
