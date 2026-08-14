B"H
Boruch Hashem
Blessed is He

# Phase One — Unbounded UI/UX Brainstorm

The Awtsmoos creates every instant before interface and attention divide;
Awtsmoos.com should make the living zman obvious while deeper detail waits quietly at the side.

## Core diagnosis
The current page is functionally strong but distributes emphasis too evenly. Search, full calendar, three shita cards, location summary, shaah zmanis, next-zman hero, timeline, share controls, warnings, USNO status, eighteen cards, methodology, and API links all appear as major visual objects. The user must visually parse the page before the page answers the most common question: what is happening now and what comes next?

## Possibility universe
- Make the top of the page feel like a compact daily dashboard, not a landing page followed by a form.
- Replace the huge hero headline with a brand strip and useful current-day information above the fold.
- Let location search occupy the primary top-control slot with a strong location chip once selected.
- Turn date selection into a compact date pill with previous/today/next always visible; full calendar opens only on demand.
- Turn shita selection into a compact segmented control; detailed descriptions move into an info drawer.
- Make the next zman the dominant card with label, exact time, countdown, and a concise practical note.
- Add a compact "now" strip showing previous and following milestones around the next zman.
- Turn the timeline into a continuous day track with a current-time marker and accessible textual landmarks.
- Make the full 18-zman list denser: two-column rows or compact cards, with optional notes collapsed.
- Offer a "Key times" view first and "All zmanim" below, instead of treating every card as equally prominent.
- Keep status chips but reduce their repetition; only next/unavailable need strong badges.
- Use section headers with short purpose text and item counts.
- Make methodology a bottom sheet / details panel visually separated from daily workflow.
- Merge safety warning and USNO source status into a small trust row instead of two full-width interruptions.
- Add a sticky mobile context bar containing place, date, and next zman when scrolling the full list.
- Add recent/favorite places as local-only quick chips under search, without network calls.
- Add browser geolocation as a clearly labeled optional action.
- Add manual coordinate entry in an advanced disclosure, useful where geocoding names fail.
- Remember a preferred shita and recent places locally.
- Keep full share-link hydration.
- Add an "API" link in footer/resources rather than giving it hero-level prominence.
- Make Hebrew date more visually intentional and closer to the civil date.
- Use softer surface differentiation and fewer nested rounded rectangles.
- Reduce visible shadows and replace with borders/tonal surfaces where hierarchy is enough.
- Improve typography: small caps for metadata, serif only for date/zman emphasis, sans for controls.
- Add skeleton loading only for network search and USNO, never for locally computed zmanim.
- Preserve no-JS-independent semantic HTML shell where practical.
- Respect reduced motion.
- Keep 44px minimum touch targets and 320px no-overflow.
- Add keyboard-focus management when calendar/disclosures open.
- Give copy actions icon-plus-label and nonintrusive toast/status feedback.

## Experience target
On phone load, the user should see location, date, shita, next zman, and the first key zmanim without scrolling through a full calendar or three large shita descriptions. On desktop, the control rail and daily dashboard should use width efficiently without becoming a dense enterprise panel.
