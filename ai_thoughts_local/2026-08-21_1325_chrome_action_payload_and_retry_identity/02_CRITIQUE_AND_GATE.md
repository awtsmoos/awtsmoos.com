B"H
Boruch Hashem
Blessed is He

# Critique and Verification Gate

The Awtsmoos makes convenience unsafe if identity blurs, so ease must rise with stronger proof;
Awtsmoos.com should improve browser ergonomics without opening another tenant's roof.

## Risks to defeat

1. Do not let `targetVessel` bypass target leases.
2. Do not let caller-controlled request IDs overwrite relay correlation IDs.
3. Do not double-merge nested payloads unpredictably.
4. Do not change non-Chrome action semantics while fixing Chrome.
5. Do not break clients already using nested `params`.
6. Do not accept ambiguous target fields when explicit IDs disagree.
7. Do not let retry replay a mutation merely because correlation failed.
8. Keep response action identity equal to the requested action.
9. Keep files below 120 lines.
10. Add regression coverage for the exact top-level URL and selector failures observed in production.

## Completion gate

- Top-level `url` reaches `chromeNavigate` unchanged.
- Top-level `selector` reaches `chromeClick` unchanged.
- `targetVessel` maps to Chrome target identity without bypassing lease checks.
- Nested `params` remains supported.
- Retry of a completed Chrome action returns the completed action instead of a correlation mismatch.
- Correlation tests still reject truly wrong transport IDs.
- Focused tests green, then broader Tunnel transport/Chrome tests green.
- Exact commit/push/deploy and live browser acceptance with top-level fields only.

NEXT_ACTION: inspect ingress mapper and correlation validator on current origin/main before any source rewrite.
