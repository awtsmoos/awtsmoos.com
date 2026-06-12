B"H

# Bulkread improvement audit plan without live visual inspection

User asked: do not look live yet; bulkread through the code a lot and infer improvements.

Method:
- Read many CSS and JS modules by families.
- Look for duplication, conflicts, missing imports, stale modules, weak tests, risky selectors, visual opportunities.
- Do not change files in this pass unless there is an obvious safety correction. The main output should be a grounded improvement map from current code.

Read families:
1. Global foundation + beauty foundation.
2. Home split + beauty modules.
3. Heichel base split + beauty modules.
4. Reader split + beauty modules.
5. Heichel app/visual/beauty JS.
6. Reader postLogic/visual/beauty JS.
7. Tests.
8. Templates.

Audit questions:
- Are entry files imports only and ordered safely?
- Are beauty modules too thin or too generic?
- Are any modules duplicated and fighting?
- Are old modules still active indirectly?
- Are pseudo-elements using body/root in ways that may stack badly?
- Is JS beauty idempotent and safe under repeated calls?
- Is progress spine re-created too often?
- Are tests actually checking high-risk behavior or just syntax?
- What improvements can be made next without live view?
