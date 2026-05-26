B"H
# UI + Workflow + Mobile + Platform Verification Brainstorm

## Grounded observations from live inspection

- `platformPanel.js` mounts globally and exposes feed, search, presence, packed DB, and sync.
- Browser helpers already exist for questions, answers, sections, reposts, shares, notifications, packed state, live replay, and feed materialization.
- The mounted platform panel does not yet expose Q/A workflows, repost/share creation, moderation queues, migration dashboards, federation visualization, packed key/read/integrity drills, or notification digest intelligence.
- `modal.js` has real UX ambiguity: the title is post/series-oriented, answer creation treats `appState.currentSeries` as `questionId`, the modal closes before API success, and failure text says series even when creating a post/question/answer.
- Existing tests prove presence of helpers and basic panel behavior, but many are static regex checks rather than full user-flow simulations.
- `routeCoverage.test.js` verifies route declarations, but not UI reachability for every route.
- `cssQuality.test.js` checks exact duplicate blocks and a few collisions, but not selector namespace ownership, mobile viewport behavior, or interaction hit targets.

## Highest-leverage improvement fronts

1. Add a workflow dashboard layer to the platform panel: feed, live, DB, moderation, migrations, content graph, notifications, federation.
2. Split `platformPanel.js` into tiny render/action modules so future surfaces do not become one giant vessel.
3. Make modal creation state explicit: post, question, answer, section, repost/share; do not infer question IDs from series IDs.
4. Add node simulations for failed create flows, empty states, button disabled/loading states, and duplicate submit prevention.
5. Add mobile simulation assertions for visible labels, action count, touchable controls, hidden panels, and overflow-safe output.
6. Build route-to-UI coverage: every backend route should map to browser helper, UI affordance, or an intentional admin-only note.
7. Add moderation storm tests: repeated approve/deny/report/escalate calls must not duplicate cards or lose status.
8. Add notification storm tests: poll loops must not create overlapping timers, unread count must reconcile after mark-read.
9. Add feed rerender storm tests: optimistic cards, repeated materialize calls, reconnect/replay idempotence.
10. Add packed DB inspector UI for shards: stats, keys, read, integrity, compact, snapshot, migration dry-run/run.
