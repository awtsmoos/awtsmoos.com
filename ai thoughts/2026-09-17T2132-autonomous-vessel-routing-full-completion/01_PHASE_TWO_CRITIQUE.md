<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
# Phase Two — Critique and Improved Design

## Twenty corrections
1. Primary/rescue is not user-facing ambiguity.
2. Explicit tunnel references must remain exact.
3. Browser-vs-native ambiguity must remain explicit.
4. Multiple canonical primaries remain ambiguous.
5. Multiple rescues remain ambiguous when no primary exists.
6. Rescue naming is a fallback signal, not authority by itself.
7. Only already-routable/authorized devices enter automatic ranking.
8. Fresh execution failure excludes a candidate before ranking.
9. Fresh acceptance failure excludes a candidate before ranking.
10. Unproven acceptance may remain routable when other health is good.
11. Primary preference must be deterministic.
12. Rescue failover must be automatic.
13. Failback must wait through hysteresis.
14. Hysteresis state must be keyed by account scope.
15. Process restart may reset hysteresis but must never select an unhealthy primary.
16. `myDevice` and actual fs-vessel routing must share one selector.
17. Selection reason must be inspectable.
18. Virtual OS remains fallback only when no lawful native/browser route exists.
19. Tracked image policy must not be weakened for a logo.
20. Drive Shliach affordance must stay functional after the binary is removed.

## Improved module split
- New `automaticNativeSelection.js`: pure ranking + small hysteresis ledger.
- `authorizedAutoSelection.js`: authorization/filtering and delegation only.
- `deviceDiscovery.js`: discovery plus shared native recommendation.
- `myDevice.js`: returns the shared recommendation instead of 409 for primary/rescue multiplicity.
- Drive: source-only Shliach mark, canonical URL unchanged, PNG deleted.

## Acceptance
- primary + rescue healthy => primary automatically.
- primary degraded + rescue healthy => rescue automatically.
- primary returns healthy => rescue remains selected until failback window elapses.
- explicit rescue reference => rescue exactly.
- browser + native without target => remains ambiguous.
- release hygiene reports zero forbidden image violations.
