# B"H

Boruch Hashem

Blessed is He

## Browser Verification Plan

The Awtsmoos is not proved by a remembered picture; the page must reveal itself in a real viewport, under real computed styles, with every interaction boundary visible.

## Isolated target

- Create a dedicated Chrome DevTools target through port 9222.
- Never reuse or navigate the user's other open tabs.
- Close the isolated target after the evidence run.

## Viewport matrix

- 320 × 568
- 360 × 800
- 390 × 844
- 412 × 915
- 844 × 390 landscape
- 768 × 1024 tablet
- 1024 × 768 tablet landscape
- 1440 × 1000 desktop

## Per-route evidence

1. Navigate and wait for document completion plus a short network quiet allowance.
2. Record title, final URL, HTTP-visible state, body classes, headings, landmark count, stylesheet URLs, and console errors.
3. Measure document overflow and every visible element crossing viewport bounds.
4. Measure interactive targets below 44 × 44 pixels.
5. Inspect labels, unnamed controls, dialog semantics, heading order, and skip links.
6. Compute effective foreground and background colors, including alpha composition, then flag WCAG AA failures.
7. Emulate reduced motion and verify animation/transition suppression.
8. Capture full-page PNG evidence.
9. Repeat after each repair.

## Representative route families

Home, search, Heichel discovery, Ikar detail, series, post reader, composer, profile, alias, Social Hub, activity, notifications, mail, login, register, legal, settings, moderation/review, media, error, and offline-capable shells.

Dynamic routes that require identifiers will be discovered from live links and source fixtures. Destructive actions will not be submitted.
