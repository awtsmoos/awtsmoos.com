B"H

# Visual CSS brainstorm: not only scroll, actual surface repair

The user asked for visual fixes, not only the scroll mechanics. The screenshots and inspected CSS reveal three main visual families:

1. Home social sanctuary:
- page can feel cramped and clipped at desktop widths
- cards are beautiful but fixed columns can crowd on mid/mobile
- side card glow pseudo-element can sit over content visually
- header buttons are default-ish and under-integrated
- feed phone needs stronger hierarchy, better responsive spacing, and safer min widths

2. Heichel navigation:
- hero can collide visually with topbar and tabs
- CURRENT HEICHEL / CURRENT SERIES labels can overlap or look too loud
- modal lacks polished layout CSS for new select/cancel/actions
- bottom nav can float over content if padding is weak
- drawers and overlays need visual clarity and safe z-index
- card grids need touch-sized targets and consistent radius/shadow

3. Post reader:
- old full-screen CSS still exists but scroll-root wins; visual polish should further normalize reader shell
- floating A/I controls are too cryptic and can overlap text
- typography details need safe panel sizing and visual hierarchy
- verse chunks need spacing, readable measure, and eager render should not create a wall of text
- sidebar hidden/open should feel like a real drawer without blocking scroll when closed

Candidate files to touch:
- geelooy/style/social/home.css full rewrite under 120ish impossible? It is ~70 lines already; rewrite with better responsive layout.
- geelooy/style/heichelos/heichel/visual-polish.css new.
- geelooy/style/heichelos/heichel/index.css full rewrite to import visual-polish.
- geelooy/heichelos/post/styles/ideal/reborn/visual-polish.css new.
- geelooy/heichelos/post/styles/main.css full rewrite to import visual-polish after scroll-root.
- geelooy/style/awtsmoos-scroll-sovereignty.css full rewrite to improve visual touch without becoming too broad.

At least 20 visual improvements:
1. Fluid home columns with better clamp widths.
2. More bottom padding under all floating nav.
3. Prevent home glow from covering links.
4. Improve home feed header button affordance.
5. Feed cards get consistent hover/touch shadows.
6. Discovery card becomes sticky only when safe.
7. Heichel topbar gets proper sticky glass and safe-area spacing.
8. Heichel hero gets better min-height and less label collision.
9. Current labels become pill/kicker with clear contrast.
10. Search row becomes stable pill input + filter.
11. Tabs gain clear active/inactive states.
12. Dynamic grids use comfortable min cards.
13. Bottom nav gets safe-area padding and backdrop.
14. Modal chamber gets full real layout.
15. Modal inputs/select/buttons become legible and touch-sized.
16. Drawer links get better spacing and backdrop polish.
17. Reader content width and rhythm improved.
18. Verse chunks get spacing and separation.
19. Floating controls become labeled circular controls with shadow.
20. Typography panel becomes a real sheet with max width/height.
21. Sidebar open state becomes bounded and scrollable.
22. Hidden sidebars cannot steal pointer.
23. Mobile reader gets top/bottom breathing room.
24. Cards and buttons use consistent transitions.
25. Respect reduced motion.

Implementation must rewrite whole files only. New files are allowed.
