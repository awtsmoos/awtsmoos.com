B"H

# Malchus Node OS Migration Pass

## Remaining / burn-down
1. Create universal Node OS layer over entity universe: every post, verse/node, comment, comment section, asset, heichel, series, mail thread becomes a filesystem-like node.
2. Preserve old APIs. Do not delete existing endpoints. Add adapters and migration scripts only.
3. Assets become first-class entity/node entries with back-links to all usage sites.
4. Comment sections and verse nodes become nodes that can be listed/read through Node OS.
5. Add migration scripts that scan legacy posts/comments/assets into Node OS indexes with dry-run and write modes.
6. Add fallback readers: Node OS tries new universe first, then old post/comment/assets paths.
7. Add UI for file-system-like social browsing.
8. Stress test old API compatibility plus Node OS migration.
