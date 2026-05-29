B"H

# Way better polish plan

## Current verified state
- Tunnel is connected.
- The ideal CSS modules are the only active owners for sidebar/inline domains.
- Tests passed before this round.

## Remaining visual leap
The prior pass made the mockup real. This pass makes it feel more expensive, calmer, and more mobile-native:

1. Add `ideal/reader-canvas.css` for the actual reading canvas: parchment, column rhythm, top header calmness, mobile spacing.
2. Add `ideal/floating-rail.css` for the left vertical rail and bottom mobile controls so floating buttons do not overlap content.
3. Improve `tokens.css` with explicit desktop/mobile sidebar width, reading column spacing, and color roles.
4. Improve `sidebar-shell.css` with mobile drag handle, desktop glass edge, and better containment.
5. Improve `sidebar-panels.css` with less cramped student rows and more premium tab/header states.
6. Improve `inline-comments.css` with a responsive body, card actions row, and tighter header.
7. Verify single-owner selectors, active import graph, node checks, tests, and css quality again.

No partial patches. Every changed CSS file is rewritten whole.
