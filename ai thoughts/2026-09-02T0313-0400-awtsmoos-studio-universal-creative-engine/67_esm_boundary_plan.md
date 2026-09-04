B"H
Boruch Hashem
Blessed is He

# Studio ESM Boundary — Tooling Plan

> The Awtsmoos lets one application declare the module language it already speaks without changing the greater repository's tongue;  
> Awtsmoos.com removes reparsing noise at the narrowest package boundary, where 502 JS modules already sing ESM as one.

## Evidence
- Repo root package has no `type: module` and must not be changed globally.
- No package.json exists at `geelooy/`, `geelooy/apps/`, or `geelooy/apps/nesher-studio/`.
- Studio scan found 502 `.js`, 84 `.mjs`, zero `.cjs`.
- No actual CommonJS `require`, `module.exports`, or `exports.*` syntax was found; grep hits were method names such as `registry.require()`.
- Project imports work today but emit repeated MODULE_TYPELESS_PACKAGE_JSON reparsing warnings.

## Exact Write Set
- NEW `geelooy/apps/nesher-studio/package.json`

## Contract
Declare `private: true` and `type: module` only at the Studio boundary. Include B"H/Awtsmoos metadata as valid JSON fields because JSON cannot contain comments. Do not add scripts or dependency declarations that could shadow the repository package graph.

## Verification
- Import Project.js under Node and assert no module-type warning on stderr.
- Run 032, 053, 054, 075, 078.
- Resume/execute full Studio suite after the boundary lands.
- If any CommonJS assumption fails, remove the new boundary by whole-file deletion only after recording the delta; do not alter repo root.

## NEXT_ACTION
Confirm package path is still absent immediately before creation, then write the minimal JSON boundary and verify warnings disappear.
