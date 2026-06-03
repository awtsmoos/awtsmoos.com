B"H

# Yesod live sockets + remaining mobile CSS plan

## From current screenshots

- Runtime cards still concatenate title/status because `.awt-runtime-card-top` lacks a wrapping layout.
- Long activeRoot paths still run into card edges in the runtime switcher.
- Buttons in runtime cards are usable but too close; need more vertical rhythm and full-width mobile behavior.
- AI provider panel starts with an empty tiny status pill / dead space before provider fields.
- Kabbalah tree footer text overlaps Malchut/Yesod on mobile; map needs taller mobile vessel and footer moved out of absolute collision.
- Task/provider cards are mostly good but need safer line wrapping and vertical spacing.

## New LIVE section

Need a real dashboard pane called `live` / `LIVE traffic` that:

- Monitors current aiAgentList and aiAgentTaskList.
- Polls actionHistoryList when available for all action traffic.
- Uses BroadcastChannel as local multi-tab live socket.
- Persists events in IndexedDB/localStorage so history returns when page becomes active again.
- Refreshes on visibilitychange/focus, even if pane was inactive.
- Categorizes streams: agents, tasks, actions, sockets, errors, system.
- Allows stream filter and history limit.
- Shows current actions and event history separately.

## Implementation

- Add `js/features/live.js`.
- Mount it from `mountFeatureVessels.js` and `mountLegacyFeatures.js`.
- Add it to `pageSpecs.js` and dashboard order automatically.
- Add `css/future/views/live.css` and import it.
- Rewrite runtime switcher CSS in `shell.css` and mobile CSS in `responsive.css`.
- Rewrite kabbalah CSS to prevent footer collision.

## Safety

No raw API keys. No partial patches. Full-file rewrites only.
