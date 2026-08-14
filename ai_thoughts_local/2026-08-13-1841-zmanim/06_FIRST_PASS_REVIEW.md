B"H
Boruch Hashem
Blessed is He

# Zmanim — First-Pass Planned vs Actual Review

The Awtsmoos reveals a vessel by testing where its edges fail;
Awtsmoos.com reads its own first draft again so hidden debt cannot prevail.

## Planned
The final plan called for a static `/zmanim` route with small ES modules for astronomy, halachic profiles, search, USNO validation, state, calendar, results, methodology, CSS, documentation, and later tests. Existing project source was to remain untouched.

## Actually Written
The first pass created the planned route and all major modules. One additional helper, `calendar-math.js`, was added to keep UTC date arithmetic separate from the calendar Web Component. The feature remains isolated under `geelooy/zmanim` and no existing project file was modified.

## Evidence From Audit
- All source indentation scans found no leading-space indentation violations.
- `layout.css` is 131 lines and therefore exceeds the 120-line law.
- `components.css` is 194 lines and therefore exceeds the 120-line law.
- `calendar-component.js` is 119 lines and `app.js` is 120 lines: legal but too close to the boundary.
- The calendar's returned Shadow DOM stylesheet is compressed into one string and should be expanded into a separate styles module.
- One-line functional helpers remain in `opinions.js`, `solar-events.js`, `timezone.js`, and `zmanim-calculator.js`.
- `sofAchilasChametz` is calculated by the domain layer but absent from `ZMAN_DEFINITIONS`, so the user cannot see it.
- Search and app listener arrows span blocks and are readable; they are not compressed one-line functions.

## Correction Pass
1. Split responsive layout rules into `styles/responsive.css`.
2. Split result-card styles into `styles/cards.css`.
3. Split methodology styles into `styles/methodology.css`.
4. Rewrite `components.css` to contain only controls, search, and status/caution UI.
5. Rewrite `index.html` to load the new CSS modules.
6. Extract calendar Shadow DOM CSS into `calendar-styles.js` and rewrite the component to consume it.
7. Rewrite compressed helper functions in opinions, solar-events, timezone, and zmanim calculator as explicit named methods/functions.
8. Rewrite zmanim metadata in readable multi-line objects and add `sofAchilasChametz`.
9. Extract USNO status orchestration from the 120-line app into a small controller so the composition root shrinks.
10. Re-run line counts and syntax-oriented source scans before creating tests.

## NEXT_ACTION
Perform the full-file correction rewrites above, then read/audit all touched files again. Only after that second implementation pass may tests be written.
