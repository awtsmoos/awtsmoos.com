# B"H
# Shared Foundation Evidence Delta

Boruch Hashem. Blessed is He.

The Awtsmoos creates one light through many vessels; Awtsmoos.com already contains two different shared UI strata, and the evidence says they should be refined rather than replaced. The raw universal layer is quiet and defensive. The Geelooy application shell is modular and accessible, yet its canonical palette still carries the saturated visual language the user asked us to leave behind.

## What was planned

- Discover whether a new universal UI system was needed.
- Find shared CSS leakage and responsive defects.
- Identify a small foundation capable of improving many pages.
- Build an audit that can drive literal every-page remediation.

## What the files actually reveal

### Universal raw UI

The universal layer is already a restrained progressive enhancement system:

- low-specificity `:where(...)` selectors;
- mostly unclassed native controls only;
- opt-out through `data-g-ui-raw`;
- 44px coarse-pointer targets;
- explicit focus-visible states;
- responsive media/table/code containment;
- safe-area dialog geometry;
- reduced-motion and forced-colors support.

This layer should not be broadly restyled merely for novelty.

### Geelooy application shell

The app shell is also localized correctly under `html.geelooy-route-ready` and `body.geelooy-app-shell`. Its tests already enforce selector ownership, accessibility, modularity, state completeness, and reduced motion.

However, its visual token vocabulary remains unusually saturated and effect-heavy:

- cyan + blue + violet + magenta canonical palette;
- multi-stop spectral gradients for ordinary shared controls;
- multiple glow tokens;
- layered control shadows;
- giant pill radius token used by shared chrome;
- decorative gradient scrollbars and panel atmosphere.

The user-visible social complaint is therefore not isolated. The shared shell can communicate futuristic quality with calmer neutral surfaces and one primary accent instead of permanent chromatic competition.

### Audit system

The audit is promising but currently conflates two different responsibilities:

- intentional foundation/global ownership;
- accidental route-local global leakage.

`cssContractScanner.mjs` flags every `html`, `body`, `:root`, or `*` selector as high severity without a source ownership policy. Intentional foundation CSS can therefore inflate results.

`plainUiScanner.mjs` is 121 lines, just beyond the vessel law. If touched, it must split structurally, never compress.

Route adapters currently cover only `/mawgawl`, leaving the broader route-family remediation architecture largely unpopulated.

## First implementation wave — pending audit counts

### Shared shell calmness

Candidate complete-file rewrite targets after fresh Git-diff/read gate:

- `geelooy/style/geelooy-app/tokens.css`
- potentially focused effect owners such as control variants/effects only after full reads.

Intent:

- preserve token names and public contracts;
- move ordinary surfaces to graphite/navy neutrals;
- keep one cyan/teal primary accent and restrained secondary blue;
- demote magenta/orange to semantic/specialized use rather than ambient shared chrome;
- reduce glow/shadow intensity without flattening hierarchy;
- keep contrast, focus, and state behavior intact.

### Audit truthfulness

Candidate new/rewritten modules after baseline audit returns:

- new `audit/cssOwnershipPolicy.mjs` or equivalent small policy module;
- complete rewrite of `cssContractScanner.mjs` to consult source ownership;
- split `plainUiScanner.mjs` only if change is required there;
- tests proving intentional shared foundation roots do not mask real route-local leaks.

### Route coverage

Do not add speculative adapters yet. Use baseline audit top production files and browser family checks to choose adapters that solve proven structural problems.

## Verification gates

1. Baseline programmatic audit summary captured.
2. Git diff/status read for every candidate target before write.
3. Full current file reread immediately before rewrite.
4. Existing shared-shell tests pass unchanged or are semantically updated only when behavior intentionally changes.
5. New audit ownership tests prove false positives fall without hiding production leaks.
6. Re-run audit and compare production-high/medium distribution, not merely total count.
7. Browser representative pages before/after shared token change.
8. Continue into page-family remediation rather than treating foundation work as completion.
