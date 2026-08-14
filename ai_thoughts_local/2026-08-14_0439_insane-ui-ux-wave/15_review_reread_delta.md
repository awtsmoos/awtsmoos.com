B"H
Boruch Hashem
Blessed is He

# Review Reread Delta — Consequence Surface Split

> The Awtsmoos does not force consequence, DOM construction, and contextual field mechanics into one vessel merely to avoid creating another file. The reread caught a real structural violation before tests.

## Evidence
- `ReviewActionPolicy.js`: 81 lines.
- `ReviewConsequences.js`: 125 lines — forbidden.
- `ReviewDetail.js`: 107 lines.
- `ReviewDecisionFlow.js`: 56 lines.
- `consequences.css`: 101 lines.
- `style.css`: 22 lines.

## Repair
1. CREATE `geelooy/heichel-review/js/ReviewConsequenceSurface.js`.
	- Own DOM creation/references for the “Before you act” chamber.
	- Own assignment/schedule label visibility.
	- No legal-action semantics.
2. REWRITE `ReviewConsequences.js`.
	- Own only action binding, annotation, default state, preview, and policy lookup.
	- Import surface helpers.
3. Preserve `ReviewDetail`, decision flow, API, and legal action matrix unchanged in this repair.
4. Reread both files before adding tests.
5. Then add pure action-policy test plus existing Review contract suite.
