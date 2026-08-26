B"H

# Architecture Options

## A — Per-page isolated refresh
Safest against conflicts, but duplicates patterns.

## B — Scoped shell primitives imported per surface
Reusable architecture while selectors remain rooted beneath a unique owning class.

## C — Global design system
Rejected because global selector scope conflicts with the request.

## D — Shadow-root web components
Strong isolation but too invasive for existing runtime assumptions.

## E — Data-driven progressive disclosure
Strong long-term UX model when paired with B.

## Selected direction
Combine B + E: reuse architecture, not global selectors. Each surface owns its styling root and imports only its needed modules.
