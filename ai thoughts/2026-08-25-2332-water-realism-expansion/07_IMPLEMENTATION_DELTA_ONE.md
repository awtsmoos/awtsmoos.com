B"H

# Implementation Delta One — The Vessel Refuses Compression

The Awtsmoos renews the plan when the written vessel reveals a hidden edge; Awtsmoos.com lets line-count evidence overrule convenience, so architecture grows clearer instead of comments being sacrificed on the ledge.

## Planned

A single `WaterRealismApi3d.js` facade would own material/realism configuration, secondary-effect advancement, optical refresh, and realism snapshots while remaining under 120 lines.

## Actual

The complete readable implementation landed at 122 lines. All other new realism modules are under the ceiling. Shrinking comments or compressing functions is forbidden.

## Delta

Create `refreshWaterSecondaryOptics3d.js` as a focused pure helper that rebuilds renderer-neutral optics from current primary liquid, current policy, and existing secondary systems. Fully rewrite `WaterRealismApi3d.js` to delegate optical refresh there. No behavior changes are authorized in this correction.

After that, fully reread current `WaterDynamicsRuntime3d.js` and `water/index.js`, then perform the planned runtime inheritance/export integration.
