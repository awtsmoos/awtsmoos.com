# B"H
# Boruch Hashem
# Blessed is He

## Three-Phase Purge Plan

### Phase One — Discovery and rescue

1. Enumerate current tracked assets by extension and MIME.
2. Enumerate ignored/untracked assets under the working tree.
3. Enumerate all historical asset paths and every blob larger than ten MiB.
4. Record current branches, tags, remotes, GitHub branch refs, and GitHub tag refs.
5. Create an all-ref Git bundle outside the repository.
6. Archive current asset files outside the repository.
7. Verify both backups before deletion.

### Phase Two — Source-tree and policy correction

1. Delete all current tracked assets through Git.
2. Delete all ignored/untracked assets from the repository working directory.
3. Rewrite the complete root `.gitignore` with broad asset/binary guards.
4. Add a small executable repository-asset audit script and test it.
5. Commit the deletion and policy as one coherent source-only commit.

### Phase Three — Historical and remote correction

1. Create an external mirror from the local repository.
2. Install or vendor `git-filter-repo` outside Git.
3. Remove every exact historical asset path and oversized binary path from every mirrored ref.
4. Expire reflogs and garbage-collect the mirror.
5. Verify zero forbidden paths, zero forbidden MIME blobs, and no oversized blobs remain.
6. Force-update only remote branches and tags that existed before the purge.
7. Fetch and reset local `main` to the cleaned remote while preserving linked worktrees.
8. Verify GitHub refs from a fresh external mirror clone.
