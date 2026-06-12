B"H

# Full Style Upgrade Pass Plan

Mission: make the UI visibly better across Home, Heichel, Reader, and shared foundation without touching runtime logic.

Rules:
- Rewrite full files only.
- Keep files small.
- Preserve imports and ownership boundaries.
- Avoid new broad global selectors except inside explicit foundation/global files.
- Verify with css-quality, import ownership, heichelos quality, import graph, small module budget, JS/CSS state, scroll visual regression.

Phase 1: Foundation
- Upgrade palette/depth/light/motion/effects tokens.
- Keep selectors minimal and reusable.

Phase 2: Home core and beauty
- Improve shell rhythm, feed cards, composer, tabs, discovery, responsive behavior.
- Preserve compatibility wrappers.

Phase 3: Heichel core and beauty
- Improve library hierarchy, hero, cards, tabs, search, mobile.

Phase 4: Reader styles
- Improve reading rhythm, controls, sidebars, overlays, progress/current/completion cues.

Phase 5: Verification
- Run contract and quality tests.
- Fix failures by full-file rewrite only.
