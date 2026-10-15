# B"H — Social API (geelooy/api/social/)

Root of the Awtsmoos.com social backend API.

## Contents
- `DOCUMENTATION.md` — entry point; points to `docs/API/SOCIAL.md`, `docs/SYSTEMS/SOCIAL_AND_HEICHEL.md`, and the generated caller index.
- `_awtsmoos.*.js` — 50 route "chapters" (derech modules), one per domain: alias, posts, series, comments, search, drive, mail, profile, heichel, packed, platform, governance, community, notifications, views, reactions, reading, books, agent, civilization, objects, entities, repositories, nodeOs, thoughts, thoughtsStreams, living, identityBootstrap, memberGovernance, interactionFlow, publishFlow, reviewCenter, socialKernel, socialSummary, richSocial, unifiedSocial destinations, publicDiscovery, profileHub, radiance, counter, keys, activityLedger, fileSystem, migrations, communications, editor, graph, content.
- `helper/` — all implementation behind those route chapters.
- `old/` — legacy comment/post/series route mounts, kept for reference.
- `test/`, `tests/` — top-level test suites.

## What it does
Gives aliases, posts, comments, Heichelos (communities), follows, signals, drive, graph, and search one vast backend domain. The derech modules mount routes; the helper tree implements them.
