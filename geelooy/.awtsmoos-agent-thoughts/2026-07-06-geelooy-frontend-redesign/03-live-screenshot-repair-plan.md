B"H

# Live screenshot repair plan

The screenshots show the home is still too stacked and card-heavy. The feed tabs are oversized, the Create pill floats awkwardly, the composer is hidden behind the dock, and the footer competes with the mobile nav. The fix is not more decoration. It is a stronger information hierarchy with richer futuristic motion kept behind simpler surfaces.

## Immediate whole-file rewrite set
- `index.html`: compact home DOM, no redundant action stack, cleaner hero + unified feed.
- Home CSS modules: split into more files, each short, with stronger comments.
- Profile CSS: reduce hero height and button stack on mobile.
- Heichelos CSS: reduce card banner height and dock pressure.

## New split modules added
- `background.css`
- `buttons.css`
- `composer.css`
- `metrics.css`
- `footer-shield.css`
- `motion.css`

## Verification goal
Home must look like a mobile-first social app: hero/search, compact quick actions, feed visible above dock, no giant dead blank space, no footer fighting bottom nav.
