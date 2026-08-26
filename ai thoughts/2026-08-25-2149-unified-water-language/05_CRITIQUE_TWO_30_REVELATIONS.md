B"H

# Second Critique — Thirty Additional Revelations

The Awtsmoos is never exhausted by the first vessel; Awtsmoos.com should therefore challenge even the improved river until hidden rocks become visible.

1. Empty-runtime construction must have a practical default grid and capacity.
2. User-supplied canonical state must remain accepted without forced recreation.
3. Runtime seed must propagate to emission defaults but each event may override it.
4. Event seeds need deterministic frame/event counters to prevent identical repeated pours.
5. Particle lifetime defaults for primary water should be effectively long, unlike secondary spray.
6. Water-ball particles need initial size tied to grid cell size unless authored.
7. Emission position should be clamped only by the existing solver, not silently at creation.
8. Emission reports should include event kind/id for debugging.
9. Source registry must support enable/disable and removal without background timers.
10. Sources advance only when `.step(dt)` is called; deterministic simulation owns time.
11. Source mass rate must reject negative/nonfinite input.
12. A source may emit zero mass if dt is zero and must not advance its event counter.
13. Transfer must reject self-transfer unless explicitly implemented as relocation.
14. Source extraction region should be optional; no region means deterministic leading-particle parcel.
15. Extraction should preserve source ordering for deterministic replay.
16. Target transfer IDs must derive from target nextId, not source IDs.
17. Splash lift should have radial falloff to avoid a hard velocity discontinuity.
18. Explosion should compose spawn-then-impulse so spawned burst particles also receive impulse consistently.
19. Diagnostics should expose primary mass after each runtime operation.
20. 3D runtime `.step()` should retain surface/secondary results from the latest frame for rendering adapters.
21. Realism profile remains an option, not baked into emitted particles.
22. Shallow runtime source IDs belong to wrapper registry because canonical shallow state does not preserve authored IDs.
23. Shallow source updates must rebuild canonical state before solver step.
24. Ocean normal calculation should come from accumulated analytic derivatives, not finite-difference sampling.
25. Ocean Jacobian/crest intent should remain bounded/inspectable.
26. Tide period must have a positive floor.
27. Ocean spectrum should allow authored components for exact art direction.
28. Default wave families should echo the existing six WebGL wavelength scales without importing renderer code.
29. Nature quality must tune runtime realism/profile only where explicitly mapped, never seeds or emitted mass.
30. Tests must verify conservation across emit, impulse, drain and transfer before visual/secondary assertions.
