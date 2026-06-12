B"H
# Bulk Read Directory Pagination Fix

Observed:
- `bulk` with only `p` directory returns zero files.
- Explicit `paths` works and truncates per-file, but page/limit behavior is confusing.
- Existing `bulkRead.js` only normalizes named specs and never walks directories.

Plan:
1. Rewrite full `geelooy/apps/tunnel/agent/tools/fs/bulkRead.js`.
2. Preserve explicit path behavior.
3. If a requested spec is a directory, recursively collect readable files under it.
4. Skip common ignored dirs/files and binary extensions.
5. Page by cursor over expanded file list.
6. Stop selected page when `pageSize/maxFiles` or `totalMaxChars/totalMaxBytes` budget is hit.
7. Return `nextPagePayload` with cursor pointing to next unread file.
8. Sync installed copy, run parser/behavior tests.
9. Regenerate manifest.

Caveat: live tunnel process needs restart to pick up rewritten modules.
