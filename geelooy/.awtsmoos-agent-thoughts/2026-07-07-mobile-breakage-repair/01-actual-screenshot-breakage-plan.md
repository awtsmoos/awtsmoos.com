B"H

# Actual Screenshot Breakage Repair Plan

User screenshots show:
- Home route cards became a horizontal/sideways cut-off layout.
- Bottom app nav overlaps content.
- Old top menu/header leaks B"H, Geelooy, hamburger, alias chip, and vertical menu.
- Page has horizontal overflow and clipped cards.

Likely cause:
- Recent view-flow adapters targeted existing classes too broadly:
  - `.home-surface-grid`, `.home-command-grid`, `.home-dashboard-grid`
  - `.profile-main-grid`, `.profile-grid`
  - `.mail-frame`, `.mail-main`
  These turned live app structures into snap carousels without JS/state coordination.

Repair strategy:
1. Rewrite broad adapters to be opt-in only via `.awt-view-flow`, `.awt-mobile-swipe`, `.awt-desktop-grid`, `.awt-snap-track`.
2. Add a focused mobile repair shield for the visible home page:
   - no horizontal overflow
   - route cards two-column but shrink-safe, not carousel
   - feed clear bottom padding
   - bottom nav fixed but content never hides behind it
   - old header/menu hidden when the modern social shell is active
3. Keep futuristic feel via sharp dark panels, tight spacing, clean border rhythm, subtle transform only on focus/hover.
4. Run gates and scan.

No heichelos/post. Whole files only.
