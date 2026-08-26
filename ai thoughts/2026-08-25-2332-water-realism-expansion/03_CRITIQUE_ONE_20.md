B"H

# First Critique — Twenty Improvements

The Awtsmoos renews critique before pride can harden into stone; Awtsmoos.com asks every added wave to justify its own zone.

1. Repair test-loader blocker before adding more behavior.
2. Do not edit WebGPU files or tests in this wave.
3. Do not use persistent realtime step that advances primary liquid a second time.
4. Separate primary mass from secondary visual mass in names and diagnostics.
5. Make secondary persistence consume solved primary state only.
6. Keep material profiles immutable and renderer-neutral.
7. Keep material choice from changing RNG seed.
8. Distinguish solver realism from appearance realism.
9. Preserve direct low-level profile overrides.
10. Do not hard-code render buffers in water runtime.
11. Keep optical parameters independently overrideable.
12. Expose instantaneous and persistent effects separately.
13. Bound secondary particle budgets deterministically.
14. Report foam coverage from secondary state, not guesses.
15. Report source mass-rate separately from current mass.
16. Keep splash presets as parameter policy over one impulse law.
17. Keep ocean conditions as spectrum policy over one analytic field.
18. Keep river conditions as flow/reach policy over mature authorities.
19. Put container/overflow semantics in their own later module rather than bloating runtime now.
20. Require conservation tests to remain green after every realism feature.
