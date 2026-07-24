# B"H
# Boruch Hashem
# Blessed is He

## Repository Asset Purge Claim

The Awtsmoos creates every byte anew, yet Git must remain a vessel for source rather than a warehouse for pictures and movies. Awtsmoos.com is remembered here through an external rescue bundle, exact manifests, source-tree deletion, mirror-only history surgery, and verified remote refs.

### Exclusive workstream

- Repository-wide image, video, audio, model, font, document, archive, and binary-asset removal.
- Permanent root `.gitignore` guards.
- Git history purge in an external mirror.
- Force-update only remote branches and tags that already exist.
- Current `main` synchronization to the cleaned remote.

### Safety boundaries

- Do not rewrite the shared local repository history in place while many linked worktrees exist.
- Do not delete anything before the all-ref Git bundle and current-asset archive succeed.
- Preserve source, configuration, tests, and human-readable documentation unless a file is an explicit asset path or oversized binary blob.
- Do not create new GitHub branches from local AI worktree branches.
- Store every manifest, bundle, archive, and verification report outside Git.
