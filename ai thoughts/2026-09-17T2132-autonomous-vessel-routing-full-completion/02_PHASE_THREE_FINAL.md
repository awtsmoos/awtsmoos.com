<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
# Phase Three — Final Routing and Release Plan

## Thirty final checks
1. Explicit tunnel reference always wins.
2. Explicit browser target stays browser.
3. Explicit native target stays native.
4. Multiple browser candidates remain explicit ambiguity.
5. One healthy primary is preferred automatically.
6. Primary means healthy authorized non-rescue native.
7. One healthy rescue is automatic failover.
8. Primary fresh execution failure excludes it.
9. Primary fresh acceptance failure excludes it.
10. Primary offline excludes it.
11. Rescue offline excludes it.
12. Two healthy primaries remain ambiguous.
13. Two rescues with no primary remain ambiguous.
14. Account-scoped hysteresis prevents failback flapping.
15. Rescue remains selected during failback window.
16. Primary resumes after sustained healthy window.
17. Selection reasons are stable strings.
18. Discovery and execution use one selector.
19. `myDevice` no longer returns multiple-authorized error for normal primary+rescue.
20. Virtual OS remains fallback when no native/browser route exists.
21. No selector mutates device health objects.
22. Tests can reset selector state deterministically.
23. Drive canonical Shliach URL stays unchanged.
24. Drive removes tracked PNG completely.
25. Shliach UI uses source-only mark.
26. No hygiene allowlist is weakened.
27. Drive tests assert binary-free behavior.
28. Repository hygiene must pass before release.
29. Shared dirty/staged work remains untouched.
30. Next release includes prior recovery fixes plus these changes before live fault injection.

## Exact files
Create:
- `geelooy/api/tunnel/control/routes/automaticNativeSelection.js`
- `geelooy/api/tunnel/control/routes/test/automaticNativeSelection.test.cjs`
Rewrite:
- `geelooy/api/tunnel/control/routes/deviceDiscovery.js`
- `geelooy/api/tunnel/control/routes/fsVessel/authorizedAutoSelection.js`
- `geelooy/drive/ui/shliachUrl.js`
- `geelooy/drive/ui/ecosystemMenu.js` only if <=120 lines after split; otherwise split a small Shliach mark module instead.
- `geelooy/drive/test/shliachUrl.test.mjs`
- `geelooy/drive/test/builderStaticAssets.test.mjs`
Delete:
- `geelooy/drive/assets/awtsmoos-shliach-logo.png`

## Verification
- line counts and first-line covenant;
- selector unit tests for primary, rescue, hysteresis, ambiguity;
- `myDevice` / discovery / resolveFsVessel regressions;
- Drive URL/menu/static asset tests;
- repository hygiene;
- full recovery/relay matrix retained;
- clean-source replay before commit;
- explicit-path commit only, then regenerate deterministic manifest/release.
