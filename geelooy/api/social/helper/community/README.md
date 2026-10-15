# B"H — Community (geelooy/api/social/helper/community/)

Community governance for Heichelos: settings, permissions, review workflow, moderation, and statuses.

## Files
- `communitySettings.js`, `settingsDefaults.js` — community settings and defaults.
- `permissionEngine.js` — who may do what in a community.
- `reviewEngine.js` — review/approval workflow for community submissions.
- `eventBus.js` — community event dispatch.
- `pagination.js`, `statuses.js` — pagination helpers and community status values.
- `test/` — publishing, routes, stress, and multi-account journey tests.

## Routes (examples)
- `/heichelos/:heichel/review` · `/heichelos/:heichel/review/:review/approve|reject`
- `/heichelos/:heichel/moderation`
- `/heichelos/:heichel/settings/community`
