B"H

# Second Critique — Thirty Further Revelations

The Awtsmoos renews the plan a second time; Awtsmoos.com lets every hidden edge become a measured rhyme.

1. `RealityTextureChannels.js` already exports exactly the missing function; use it rather than creating a compatibility duplicate.
2. Preserve any concurrent user changes outside water; current status shows `VegetationNatureDefaults.js` modified and must remain untouched.
3. Material names should normalize aliases but reject unknowns clearly.
4. Fresh water defaults should remain close to current optical constants to preserve compatibility.
5. Ocean water should increase scattering/absorption/turbidity modestly, not cartoonishly.
6. Muddy/pond water may increase turbidity/roughness but should not silently alter conserved mass.
7. Viscous demonstration materials should be explicit, not default Nature water.
8. Solver profile values must be finite-clamped, including thresholds currently not clamped.
9. Existing dense preset file should be rewritten whole if touched.
10. Existing `applyLiquidRealism3d` has compressed helpers; avoid touching it unless tests demand it.
11. Persistent secondary state should carry source liquid id/tick/time for provenance.
12. Secondary emission systems already assign stable ids; preserve them.
13. Secondary particles must have budgets per role to prevent runaway waterfalls.
14. Foam should advect/life-decay separately from spray.
15. Bubbles should retain upward buoyancy.
16. Mist should remain light and ephemeral.
17. Persistent artifacts should be optional to avoid unnecessary CPU cost.
18. Runtime should default persistent effects off or bounded? Prefer on only for balanced+ through explicit policy if cost is acceptable; verify.
19. `appearance()` must work before any timestep on empty fluid.
20. `effects()` must return empty stable systems on empty fluid rather than throw.
21. Runtime material changes should affect future realism/appearance but not mutate existing particle mass.
22. Realism mode changes should not reset state.
23. Source emissions should inherit current material metadata only if useful and non-structural.
24. `step()` output should expose derived realism snapshot without changing old fields.
25. Keep old `lastStep` compatibility.
26. Nature quality mapping should remain additive and not override explicit runtime profile/material.
27. River/ocean/shallow improvement can follow as separate passes after 3D CPU realism is verified.
28. Container transfer is important but comes after realism foundation to keep unit-of-work coherent.
29. Tests should prove material changes don't alter mass or determinism of structural particle positions before stepping.
30. Final regression wave excludes WebGPU exactly per user request, but CPU reality/realtime/river/shallow suites remain mandatory.
