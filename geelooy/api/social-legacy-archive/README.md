# B"H
# Blessed is He
# Boruch Hashem

# social-legacy-archive

Legacy trees moved here 2026-10-20 (impl phase 3, split program) from:

- `geelooy/api/social/old/` → `old/` (4 JS files, 1,301 lines)
- `geelooy/api/social/helper/old/` → `helper-old/` (8 JS files under `comments-old/`, 6,376 lines)

## Why archived instead of split

The 120-line split program covers live code. These trees are the retired
pre-rewrite comment system ("comments-old") and are **provably unreferenced**:

1. Repo-wide grep for `require()` paths containing `helper/old`, `/old/`, or
   `comments-old` across `geelooy/` + `ayzarim/` (excluding the trees
   themselves): zero matches.
2. Plain-string grep for `comments-old` across `geelooy/api/` +
   `ayzarim/awtsmoosDynamicServer/`: zero matches outside the trees.
3. Relative-require grep into any `old` directory across `geelooy/api/`:
   zero matches.

Per the migration DESIGN (section d): dead legacy files are archived out of
the tree, not split. Nothing is deleted; history is preserved by `git mv`.

## Restore

```sh
cd /mnt/HC_Volume_102267213/git/awtsmoos.com
git mv geelooy/api/social-legacy-archive/old geelooy/api/social/old
git mv geelooy/api/social-legacy-archive/helper-old geelooy/api/social/helper/old
```
