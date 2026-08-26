B"H
Boruch Hashem
Blessed is He

# Phase Two — Gevurah: Preserve Everything Before Deletion

The Awtsmoos gives Gevurah a boundary: deletion may remove redundant branches and worktrees only after their living content is proven preserved in main.

## Observed branch facts

- Local main is behind origin/main by ten commits.
- Remote currently exposes only origin/main.
- Every non-main local branch has zero commits that are missing from origin/main.
- Two non-main branches are attached to worktrees; many additional detached worktrees exist.
- Main working tree contains a very large set of staged, unstaged, and untracked changes, including tunnel stability/sub-agent work and unrelated systems.

## Safe consolidation constraints

1. Run a secret scan before creating a pushable commit.
2. Commit the complete current working-tree state on local main so no dirty change can disappear during synchronization.
3. Merge origin/main into that local commit; do not force-reset main to remote.
4. Resolve conflicts manually/semantically where Git cannot preserve both sides.
5. Verify no unresolved conflict markers remain.
6. Run broad syntax/tests appropriate to changed subsystems, with tunnel-focused release gates mandatory.
7. Push unified main before deleting local branch refs.
8. Remove worktrees that hold branch refs before deleting those branches.
9. Remove stale detached release/sparse worktrees after proving they do not contain uncommitted work.
10. Verify branch refs after cleanup: only refs/heads/main and refs/remotes/origin/main may remain.
11. Release tags are allowed as immutable release witnesses; no release branches are allowed.
12. Production must fast-forward to unified origin/main only.

The branch names are shadows; the code is the ohr. Gevurah removes only shadows after every spark is gathered into main.
