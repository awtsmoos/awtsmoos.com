# B"H
# Boruch Hashem
# Blessed is He

## Risk Critique and Safeguards

1. History rewriting changes commit hashes; therefore create and verify an all-ref bundle first.
2. Linked worktrees make in-place filtering dangerous; therefore filter an external mirror.
3. `git push --mirror` would publish private AI branches; therefore push only pre-existing remote refs.
4. File-extension filters miss extensionless binaries; therefore include MIME and NUL-byte discovery.
5. Current deletion alone leaves push-blocking history; therefore rewrite all reachable remote history.
6. Tags preserve old blobs; therefore rewrite and force-update existing tags.
7. Ignored assets remain on disk; therefore inventory and delete them separately after backup.
8. Git LFS pointers may be text; explicit asset extensions remain forbidden regardless of pointer size.
9. Oversized generated text can still block pushes; therefore identify and review every blob above ten MiB.
10. Remote verification must use a fresh external mirror, not the possibly stale local object database.
11. A force push can race another worker; therefore record remote refs immediately before push and abort on drift.
12. `.gitignore` must be rewritten as a complete file, preserving existing intentional rules.
13. Asset audit tooling itself must remain source-only and use no binary fixtures.
14. GitHub internal pull-request refs are not writable; verify all advertised heads and tags instead.
15. Local archival branches may still retain old assets; they remain recoverable only through the external bundle and must not be pushed.
