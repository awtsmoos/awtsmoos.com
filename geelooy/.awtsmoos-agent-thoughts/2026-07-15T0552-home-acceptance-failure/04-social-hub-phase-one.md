# B"H

Boruch Hashem

Blessed is He

# Social Route Phase One — Verified Failure Inventory

The Awtsmoos reveals the route through rendered evidence, not through the newer Social Hub's reputation.

## Proven failures at `/social/`

- Mobile document width is 864 pixels inside a 390-pixel viewport.
- Five visible text fields use native white backgrounds, inset borders, zero radius, Arial, and 21-pixel height.
- Ten navigation buttons render at 40 pixels tall.
- The active stylesheet is a compressed light-theme file with no form ownership.
- The presence stylesheet is also compressed and light-themed.
- The renderer emits semantic labels but no structural classes around field copy or action groups.
- Initial overview requests are awaited serially.
- Every repaint replaces the tree and binds individual listeners again.

## Existing architecture to preserve

- Route: `/social/`
- Root: `#BH_SOCIAL_HUB.social-hub-root`
- API namespace: `/api/social`
- Existing tabs, field names, panel keys, socket actions, and result cards.
- Existing WebSocket and page-presence contracts.

## Release proof

- Zero native/plain controls in collapsed and rendered states.
- Zero actionable targets under 44 pixels.
- No horizontal overflow at 320, 390, 768, and 1440 pixels.
- Read-only initial panel requests execute in parallel.
- One delegated interaction layer survives repaint.
- All production files remain focused and at most 120 lines.
