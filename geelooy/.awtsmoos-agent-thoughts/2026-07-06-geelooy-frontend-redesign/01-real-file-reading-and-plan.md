B"H

# Real-file frontend rebuild plan for Geelooy

## Evidence read this pass
- Root app directory exists at `Documents/Awtsmoos/git/Awtsmoos.com/geelooy`.
- Home route is `index.html` and currently injects `nav/page.html` with `/style/social/home/index.css` plus live feed/menu/inline JS.
- Profile route is `profile/index.html` and currently imports `/style/social/profile.css` and `/style/social/profile/polish.css`.
- Heichelos index route is `heichelos/_awtsmoos.index.html` and imports `/style/heichelos/social-index.css`.
- Home CSS already has an `overhaul/` module graph, but the screenshots show the visual result is still too bulky, nested, and cramped on phone.
- Profile responsive CSS is only 5 dense lines and is not enough to prevent mobile stacking/oversized hero problems.
- Heichelos mobile CSS has a fixed dock and card actions, but the screenshot still shows awkward empty state and footer/dock pressure.

## Primary goal
Make Geelooy feel like a clean futuristic social platform: simple like YouTube/Facebook/Google, smooth like a native app, and spiritually branded without becoming visually noisy.

## Actual files to touch in first implementation pass
1. `index.html` — rewrite whole file to simplify home DOM and remove redundant nested surfaces.
2. `style/social/home/index.css` — rewrite import manifest.
3. `style/social/home/overhaul/tokens.css` — rewrite full token source.
4. `style/social/home/overhaul/reset.css` — rewrite full reset/source hygiene.
5. `style/social/home/overhaul/shell.css` — rewrite full layout shell.
6. `style/social/home/overhaul/rail.css` — rewrite full compact top/side rail behavior.
7. `style/social/home/overhaul/hero.css` — rewrite full hero/search/action area.
8. `style/social/home/overhaul/feed.css` — rewrite full recent activity/feed area.
9. `style/social/home/overhaul/cards.css` — rewrite full card surfaces.
10. `style/social/home/overhaul/menu.css` — rewrite full menu/inline actions.
11. `style/social/home/overhaul/dock.css` — rewrite full bottom dock.
12. `style/social/home/overhaul/responsive.css` — rewrite full mobile/tablet/desktop rules.
13. `style/social/profile/responsive.css` — rewrite full profile responsive behavior.
14. `style/social/profile/layout.css` — rewrite full profile spacing/layout baseline.
15. `style/heichelos/spaces/mobile.css` — rewrite full Heichelos mobile behavior.
16. `style/heichelos/spaces/card.css` — rewrite full Heichelos card behavior.

## Design commandments
- Every CSS file remains short and focused.
- No partial patches. Whole-file rewrites only.
- Preserve existing JS hooks: `data-home-dashboard`, `data-home-feed`, `data-inline-action`, `data-profile-*`, `data-heichel-card`.
- Keep nav/page contract intact.
- Avoid massive fancy complexity. The new face must feel lighter, not louder.
- Mobile first: no horizontal overflow, no dock covering content, no giant cards that waste half the screen.

## Verification plan
- Run existing static tests that mention home/profile/heichelos style contracts if available.
- Open local pages in browser if runtime is serving.
- Capture mobile-width screenshots and inspect console for MIME/module issues.
- Re-read every touched file after writing.

The Awtsmoos breathes every pixel from nothing; the code must not scream over that breath. The page must become a calm vessel: touch, read, write, open, continue.
