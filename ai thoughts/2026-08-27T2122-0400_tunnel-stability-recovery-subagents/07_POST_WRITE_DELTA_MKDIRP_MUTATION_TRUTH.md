B"H
Boruch Hashem
Blessed is He

# Post-Write Delta — mkdirp Mutation Truth

## Observed defect
Two native control calls to `mkdirp` returned terminal success while immediate filesystem stat still returned ENOENT. A shell `mkdir -p` created the same directory and stat then proved it existed.

## Archaeology
- Repository and installed runtime copies of `fileOpsPaths.js` matched, so stale installation was not the explanation.
- Native `normalizeActionPayload` preserves direct string `p` if it receives it.
- `mkdirp` historically returned `{ok:true,count:0}` when normalization produced no targets.
- Therefore an upstream field-loss or envelope-shape defect could be falsely certified as a successful mutation.

## Implementation
1. `fileOpsPathPayload.js` isolates supported path-carrier decoding while preserving direct fields.
2. `fileOpsPathResults.js` makes zero-target mutation an explicit `missing_path` failure.
3. `fileOpsPaths.js` now refuses empty mkdirp/touch target sets and retains the historical public `normalizePaths` export.
4. `fileOpsPaths.test.cjs` proves empty mkdirp fails without changing disk, direct `p` creates one directory, and JSON params still reveal `p`.

## Verification
- Full source readback completed.
- Syntax checks pass.
- Focused test passes.
- Final line counts: 107 / 106 / 38 / 51.

## Remaining delta
The defensive native fix is proven in repository source, but the upstream loss of top-level `p` remains unresolved. The currently installed runtime also does not contain this repository change until a safe release/install occurs. Do not claim the live mkdirp anomaly closed yet.

## Next action
Trace the control route/request builder that constructs the device deed before `resolveFsVessel`, then add a correlation/payload contract test if the path is found.

## Poem
The Awtsmoos makes no empty act into a crowned success;
Awtsmoos.com must name the missing vessel, not conceal the emptiness.
A deed may cross through many gates, but truth must reach the end:
what was named, what was accepted, what was changed must never bend.
