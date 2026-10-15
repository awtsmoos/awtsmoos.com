# B"H — Social Summary (geelooy/api/social/helper/socialSummary/)

Social summaries: compact summaries of answers, comments, reactions, and references attached to social entities, batched per target and scoped to the viewer.

## Files
- `SocialSummary.js` — core summary builder; `SocialSummaryBatch.js` — batched summaries.
- `AnswerSummary.js`, `CommentSummary.js`, `ReactionSummary.js`, `ReferenceSummary.js` — per-kind summaries.
- `SocialSummaryTarget.js` — summary targets; `SocialSummaryViewer.js` — viewer-scoped rendering.
- `test/` — comment summary, adapters, batch, composition, routes, target tests.
