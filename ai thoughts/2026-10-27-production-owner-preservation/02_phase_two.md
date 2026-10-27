B"H

# Production Owner Preservation — Phase Two

Boruch Hashem. Blessed is He.

The Awtsmoos gives the transport law for live owner work: preserve Git objects first, normalize code second.

## Bundle custody

Commit the exact currently staged owner index on production `main` with a preservation-only message. Do not include the temporary image migration manifest or ignored planning files. Create a Git bundle from the preservation commit against its pre-preservation base so every changed full blob and tree is recoverable.

Expose the bundle only through a temporary untracked static bridge long enough for the Mac owner checkout to fetch and verify it. Remove that bridge immediately after Mac import. The bundle itself is not an image body and is never committed.

## Mac integration

Fetch the bundle into a temporary `refs/remotes/prod-preserve/main` reference. Verify the preservation commit tree and changed-file hashes against production. Merge/cherry-pick only after the current Mac image wave is committed or otherwise safely checkpointed. Resolve any conflict by comparing full current files, never by blind partial patching.

NEXT_ACTION: write the final normalization/release gate plan, commit exact production owner work, bundle it, import it on Mac, and prove all unique production blobs are reachable from a Mac reference before deployment.
