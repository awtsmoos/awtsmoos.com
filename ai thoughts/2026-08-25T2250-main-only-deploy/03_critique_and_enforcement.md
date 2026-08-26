B"H
Boruch Hashem
Blessed is He

# Phase Three Critique — One Main Must Also Be Safe

The Awtsmoos gathers every spark without gathering poison into the vessel; Awtsmoos.com therefore preserves all legitimate work while refusing to publish secrets, duplicate source authorities, or hidden dirty worktrees.

## Final improvements before execution

1. Secret-scan the complete dirty tree before commit.
2. Audit every registered worktree for uncommitted/untracked files before removing it.
3. If a detached worktree is dirty, fold its unique changes into main before removal.
4. If an attached branch worktree is dirty, preserve those changes before deleting the branch/worktree.
5. Commit the current main working tree first so synchronization cannot erase local work.
6. Merge origin/main normally so Git performs three-way conflict detection.
7. Never solve conflicts with blanket `ours` or `theirs`.
8. After merge, scan for conflict markers and unresolved index stages.
9. Run syntax/test gates on the unified tree, not only the tunnel subset.
10. Preserve all AI-thought artifacts because the user explicitly requested all unrelated changes too.
11. Push main before branch/worktree deletion so remote main becomes the recovery source of truth.
12. Delete every non-main local branch after proof it is contained.
13. Verify remote branch set contains only origin/main.
14. Remove obsolete detached release/sparse worktrees after dirty audit.
15. Add repository Git policy hooks/scripts so pushes/commits on non-main branches are rejected locally.
16. Keep immutable release tags allowed; tags are witnesses, not alternate development branches.
17. Build the tunnel release directly from main, never from a release branch.
18. Deploy production server to the same main SHA that generated release metadata.
19. Reinstall the Mac only after public bundle closure proves exact SHA/version.
20. Run real sub-agent communication after install, not only scheduling tests.
21. Require agent A to send browser prompt and agent B/result record to show accepted delivery.
22. Repeat identical spawn intent and prove no duplicate browser vessel.
23. Soak lifecycle history and prove no fresh-success SIGTERM.
24. Re-run branch census at the very end and fail completion if any non-main branch exists.

The final twist is restraint: one branch is not simplicity if hidden worktrees or secrets remain. Tiferes gathers every spark into main while Gevurah bars every unsafe shadow.
