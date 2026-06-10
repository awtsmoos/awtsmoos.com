B"H

# Malchus Public Profile Final Pass

## Goal
Make `/@alias` match the clean mobile mockup through small complete modules, API-first data, split CSS, no unused duplicate profile files, and real Node tests.

## Exact work
1. Split API profile helper into small modules: paths, sanitize, templates, heichelos, posts, comments, tree, stats, activity, readProfile, writeProfile, index.
2. Rewrite `_awtsmoos.profile.js` to route to the new helper index only.
3. Split frontend profile into state, API, render, hydrate, actions, tabs, and components.
4. Split CSS into profile folder imports and stop using `public-profile.css`.
5. Rewrite `/@` route to load the new JS and CSS.
6. Delete obsolete profile files after replacements are verified.
7. Add contract tests for split CSS, clean UI, aggregation, comments, tree, write permissions, and no obsolete files.
8. Run route tests, profile tests, burst test, real server test, concurrency test.

## Constraints
Every file written complete. No partial patching. Keep files small. No placeholders. Preserve reader/comment anchors. Every claim must be verified.
