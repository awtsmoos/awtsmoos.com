B"H
# Accessibility and Mobile Law

## Structural requirements
- One meaningful main region for the primary work.
- Native buttons, links, labels, details/summary and form semantics before custom ARIA.
- Visible keyboard focus.
- Skip links reveal on keyboard focus rather than remaining permanently hidden.
- Menus/sheets/disclosures must have keyboard dismissal and sane focus restoration.
- Custom state changes use polite/assertive live regions only where they add real information.

## Mobile requirements
- Design structurally for 320, 375 and 430px widths; do not rely on desktop shrinkage.
- Respect `viewport-fit=cover` and safe areas where fixed controls meet device edges.
- Primary touch controls should meet the shared target-size law.
- Document-level horizontal overflow is a failure; local editors/media strips may scroll intentionally.
- Advanced controls collapse instead of producing giant action rows.
- Virtual keyboard/forms/composers must keep the active field reachable.

## Motion
All decorative motion must have a reduced-motion path. Coarse/mobile devices should not pay for expensive visual effects merely to preserve desktop spectacle.

## Current executable witnesses
- `remainingAccessibility.test.mjs`
- `uiMotionArchitecture.test.mjs`
- responsive OS/shell contracts
- maintained runtime audit at 1440/430/375/320
