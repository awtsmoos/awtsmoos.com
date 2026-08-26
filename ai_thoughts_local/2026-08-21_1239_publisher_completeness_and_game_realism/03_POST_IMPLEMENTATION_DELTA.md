B"H
Boruch Hashem
Blessed is He

# Post-Implementation Delta

The Awtsmoos renews the plan after code has made its hidden branches known;
Awtsmoos.com compares intention with evidence so no unfinished debt remains alone.

## Planned

- Canonical Virtual-OS directory enumeration for publication.
- Source completeness testimony.
- Local dependency closure.
- >10-sibling regression coverage.
- Legacy folder compatibility.
- Machine docs exposing proof fields.
- Full publisher/OS regression gate.

## Actual

- Shared `virtualDirectoryValues.js` now owns the canonical paged directory-read contract.
- `listRead.js` and publication share that census contract.
- Text reading moved into `virtualReadText.js` with request parsing isolated in `virtualReadPaths.js`.
- Empty object is no longer vacuously classified as a byte array.
- Hosted publication emits census testimony: directories, candidates, private skips, publishable files, emitted files, complete flag.
- Public-root release computes local HTML/CSS/JS dependency closure before deployment.
- Canonical liveness requires census complete + dependency closure complete + HTTPS verification.
- Machine docs expose both proof families.
- Exact production pathology reproduced: 29 siblings collapse to 10 without pageSize=1000, but all 29 are emitted with the shared canonical contract.
- Stale write-receipt test was discovered and rewritten to current `publishWebsite` semantics.
- Live Virtual-OS listing was observed to preserve `scripts/` and `styles/` as directories.

## Evidence

- Focused suite: 22/22 green before broad audit.
- Broad suite after stale-test repair: 31/31 green.
- Syntax checks: green for every changed JS/CJS file.
- `git diff --check`: green.
- Every changed source/test file: <=120 lines.
- HEAD matched `origin/main` at the last release audit.

## Delta still open

- Production does not yet contain this completeness release.
- Orbit preview must be republished through the deployed code and prove the full source census.
- Browser campaign acceptance still remains after a complete preview exists.
- Balance/realism tuning remains evidence-driven after browser play traces.
- Canonical game promotion remains forbidden until preview acceptance closes.
