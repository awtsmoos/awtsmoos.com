# B"H
# Audit Truthfulness Execution Map

Boruch Hashem. Blessed is He.

The Awtsmoos lets a mirror reveal the face without becoming the face. Awtsmoos.com needs an audit that condemns real leakage, not every selector that merely remembers the document root; and it needs to run quickly enough that every repair can be measured again before the next light appears.

## Baseline evidence

- 4,899 total findings.
- 4,681 classified production.
- 3,331 production high severity.
- 1,350 production medium severity.
- 2,811 `unscoped-global-selector` findings dominate the report.
- Internal `.awtsmoos-agent-thoughts` and `.awtsmoos-agent-transfer` files appear in the production sample.
- Qualified app roots such as `body[data-mobile-scene]` are incorrectly flagged.
- Newly scoped `html.geelooy-route-ready` shared-shell selectors are incorrectly flagged.
- Z-index is checked in both generic line patterns and the specialist CSS scanner, creating duplicate medium signals.
- Full scan took about 59 seconds because source files are processed sequentially.
- `plainUiScanner.mjs` is 121 lines and must split if touched.

## Exact source changes

### `audit/plainUiPatterns.mjs`
- Add internal agent-memory/transfer/sandbox directory names to ignored directories.
- Keep generic interaction patterns.
- Remove generic `arbitrary-z-index`; CSS specialist remains the single z-index owner.

### New `audit/cssOwnershipPolicy.mjs`
- Recognize intentional universal foundation paths.
- Flag bare `html`, `body`, `:root`, `*`.
- Flag descendants/combinators rooted in bare `html` or `body`.
- Treat qualified app roots such as `body.foo`, `body[data-x]`, `html.foo` as explicit ownership boundaries.
- Keep policy pure and unit-testable.

### `audit/cssContractScanner.mjs`
- Delegate selector ownership decision to the new policy.
- Preserve rigid-width and z-index specialist checks.

### New `audit/uiSourceFileScanner.mjs`
- Move per-file read, legacy line pattern collection, and specialist dispatch out of `plainUiScanner.mjs`.

### `audit/plainUiScanner.mjs`
- Become a small orchestration module.
- Process source files in bounded concurrent batches instead of strictly serial reads.
- Preserve deterministic final sorting/freezing.

## Test obligations after code

- Bare body/root still produces high finding.
- Qualified body/html application roots do not.
- Universal foundation bare roots are allowed only in explicit foundation paths.
- Internal agent directories are excluded.
- Large z-index produces one specialist signal, not duplicated generic + specialist signals.
- Full scanner ordering remains deterministic.
- Every touched/new module <=120 lines.
- Re-run full audit and compare duration and finding distribution to baseline.
