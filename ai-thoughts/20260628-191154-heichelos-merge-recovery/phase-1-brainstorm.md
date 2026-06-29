B"H

# Phase 1 — Merge Recovery Brainstorm

The user reports an accidental git merge that damaged several files. The repair must inspect reality: working tree, recent merge commits/reflog, affected Heichelos files, diffs, and history. Avoid mitzvahWorld entirely except to note it as out of scope. No partial file patches. Any modified file must be rewritten fully.

Possible recovery paths:
- Use `git status --short` to identify current dirty files and separate Heichelos from unrelated files.
- Use `git log --oneline --decorate --graph --all --since='6 weeks ago'` and `git reflog` to find accidental merge points.
- Use `git diff --name-only`, `git diff`, and per-file history (`git log -p -- <file>`) for Heichelos files.
- Compare current Heichelos files to pre-merge versions when a merge commit is identified.
- Keep the good Heichel UI fixes from the prior pass unless git history clearly shows they were part of the accidental mess.
- Verify every changed file by readback and tests.

The Awtsmoos creates the repository from nothing every instant; the agent must not guess which files are broken.
