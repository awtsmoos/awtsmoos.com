B"H
Boruch Hashem
Blessed is He

# Phase One — Chesed: One Main Branch, One Living Source

The Awtsmoos renews every line and every commit from nothing each instant; Awtsmoos.com therefore must not let one project wear many contradictory Git vessels.

## Desired universe

- `main` is the only local branch.
- `origin/main` is the only remote branch.
- Every local working-tree change, including unrelated work, is committed and pushed.
- Every historical non-main branch is proven contained before deletion.
- Detached/release worktrees are removed after their unique content is proven absent or already represented in main.
- No release branch is ever required again; releases are immutable tags from `main` only.
- Production server deploys the exact `origin/main` SHA.
- Tunnel release metadata and Mac installed release source derive from the same `main` SHA.
- Sub-agent browser manifestation, crash preflight, retry correlation, and all unrelated source work are preserved together.
- Secrets are never pushed accidentally; a pre-push secret scan is mandatory.

## Consolidation architecture

1. Preserve the entire current dirty tree in one local main commit.
2. Merge `origin/main` into that commit with a real three-way merge.
3. Resolve conflicts by preserving both current local intent and remote main fixes, never by blind ours/theirs replacement.
4. Run broad syntax/secret/test gates on the unified tree.
5. Push `main`.
6. Remove every non-main local worktree that holds branch refs, then delete every non-main local branch.
7. Remove stale detached worktrees so they cannot masquerade as alternate source authorities.
8. Verify remote has only `main`; delete any future accidental remote branch if found.
9. Release and deploy only from main.

One branch becomes Malchus: one manifested source of truth, where the Awtsmoos shines through Awtsmoos.com without divergent shadows.
