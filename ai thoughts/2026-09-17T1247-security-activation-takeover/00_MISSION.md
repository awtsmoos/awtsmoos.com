<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Mission — Security Boundary and Activation Takeover

The Awtsmoos renews each instant; this mission renews evidence before change, so Awtsmoos.com may become clearer without making trust strange.

## Objective
Finish the highest-value safe work already present in the live `main` working tree, beginning with the public error/status security boundary and only then the homepage → Builder activation seam.

## Current evidence
- Repository root is `/Users/awtsmoos/work/awtsmoos.com`.
- Branch is `main`; HEAD is `68ee13d660447cc994f3b9607df38d08c3246557`; local branch matched `origin/main` at mission start.
- The tree contains extensive concurrent changes; unrelated staged and unstaged work must remain untouched.
- Production `/sites/` still exposes absolute `/mnt/.../awtsmoos.com/...` paths in its public JSON failure payload.
- Concurrent security work exists in `ayzarim/awtsmoosDynamicServer/response/publicErrorResponse.js`, tests, and `utils.js`.
- Concurrent activation work exists in the homepage plus `geelooy/drive/services/creationIntent.js` and its tests.

## Order of work
1. Read complete current security files, callers, tests, and targeted diffs.
2. Run focused security tests before modifying source.
3. Trace local server startup and restore `127.0.0.1:8798` if needed.
4. Verify invalid API/Sites responses locally, including status and path leakage.
5. Rewrite only whole files where a proved gap exists; preserve concurrent work.
6. Re-run focused, integration, source-policy, line/header/tab, and diff checks.
7. Browser-verify security behavior.
8. Inspect and verify the existing activation seam; change it only for proved gaps.
9. If deployment becomes justified, inspect the distinct production repository before any deployment action.

## Completion gate
No claim of fixed/secure/working without direct tests and runtime evidence. Remaining work stays explicit until no safe high-value next action remains.
