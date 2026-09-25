B"H

# Boruch Hashem — Phase One: Chesed Brainstorm

Blessed is He.

The Awtsmoos opens possibility wider than the screen can hold;
Awtsmoos.com should gather that abundance into Torah paths both living and bold.

## Unbounded ideal

Imagine the Ikar experience as one coherent Torah operating system rather than a collection of pages. A learner should never need to understand which generation of UI they are currently using. Discovery, reading, translation, Tanach lookup, related-source search, section search, and global search should share the same visual grammar and state machine.

## Every useful possibility

### Discovery and cards

- Make the whole Heichel card the primary link. One tap anywhere on the card opens it.
- Remove the visible `Open` button from public cards.
- Keep Contribute / Manage as secondary contextual controls in a kebab or compact action strip outside the primary link so no nested-link accessibility problem exists.
- Give Ikar a distinct but not oversized Torah-library treatment.
- Make search results use the same card interaction as the default list.
- Add pressed/hover/focus feedback to show that the card is interactive.
- Preserve direct deep links and browser status-bar URL behavior by using real anchors instead of JS-only click listeners.

### Ikar root

- Collapse the giant hero into a compact library header with title, short purpose, search, and recent/featured paths visible in the first viewport.
- Server-render final geometry, not a placeholder geometry that later mutates dramatically.
- Never render a disabled search field as if it were usable.
- If search JS is not ready, either provide a working server form or render a small skeleton placeholder with truthful copy.
- Make `Torah Library` navigation stable from first paint.
- Let the root show a few high-value categories / recent paths, then browse all.

### Section browsing

- Turn numbered section cards into full-card links.
- Reduce wasted height while keeping comfortable touch targets.
- Use bilingual title treatment that wraps naturally without looking like repeated machine aliases.
- Keep search sticky or easily reachable on long lists.
- Show live result counts and an empty state when filtering.
- Preserve keyboard, screen reader, and RTL semantics.
- Consider optional recent/favorite state later, but do not block the repair on it.

### Translation hub

- Keep `תרגומים ומילון · Translations & Dictionary` as a dedicated workspace, but give it compact header geometry.
- Search should be the first useful control, not buried below a poster-sized title.
- Dictionary browse should use the same clickable-card primitive as Ikar sections.
- Results should use the same loading/error/empty semantics as selected-text translation.
- Share typography, tokens, buttons, and result rows with the reader study sheet.

### Reader selected-text study tools

- Replace disconnected popovers/panels with one `Study Sheet` component.
- Mobile: bottom sheet with sticky drag/header region and internal scroll.
- Desktop/tablet: side drawer or anchored panel using the same state model.
- Header shows selected phrase, detected language, close action.
- Primary modes: Translate / Tanach / Related.
- Optional actions: Copy, open full search, source metadata.
- Switching mode preserves the selected text and cancels stale requests from the previous mode.
- Re-selecting text updates the same sheet instead of stacking another overlay.

### Related search

- Keep Quick / Semantic / Exact as engines, but stop rendering them as three unrelated vertical mini-apps.
- Present them as tabs/chips or grouped result sections under one request coordinator.
- One loading skeleton at the workspace level, then progressive lane results.
- One meaningful error per failed lane; no repeated `Search is temporarily unavailable` copy filling the sheet.
- If one lane fails, others remain usable.
- Exact Hebrew and Tanach exact behavior should be chosen from language intent but explained in human terms.
- Full semantic/full text links become secondary “Open full search” actions rather than competing headlines.

### Tanach search

- Replace giant white modal with the shared Study Sheet geometry.
- Sticky header: query, exact count, close.
- Scroll results inside the sheet, not the whole page behind it.
- Compact verse cards: reference, occurrence count, verse text, one clear `Open verse` primary link.
- `Hebrew + English` becomes a secondary action or preference rather than a separate oversized link after every card.
- No-result state should be centered and useful with suggestions: remove niqqud/punctuation, try a shorter phrase, open full Tanach search.
- Highlight matches without breaking Hebrew directionality.
- Keep safe-area spacing above Android/iOS browser bars.

### Main Sefarim search

- One primary query field, always visible.
- Search mode chips: All / Exact / Meaning / Tanach, only if modes are actually distinct and functional.
- Source filters live behind a filter control, not as exposed capability machinery.
- A single result list grouped by source/corpus, with compact source metadata.
- Query and mode reflected in URL for share/back behavior.
- Debounce typing and cancel stale requests.
- Distinguish: loading, no results, partial results, offline/unavailable, hard error.
- Never show internal capability language or duplicate lane failure cards to ordinary users.

### Shared visual system

- Create a small Ikar design-token layer for surfaces, borders, elevation, radii, spacing, typography, Hebrew line-height, focus, overlay, and safe-area values.
- Use dark surfaces consistently; white sheets only if intentionally designed for contrast, not because an old component uses white defaults.
- Limit decorative borders and nested rounded boxes.
- Use one accent family and one semantic success/error/warning system.
- Normalize 44–48px minimum touch targets.
- Use motion sparingly for sheet opening, card press, result arrival; honor reduced motion.
- Never let floating presence badges overlay dialogs/sheets.

### Boot/performance

- Server render usable Ikar geometry immediately.
- Hydrate/enhance in place without replacing blocks or causing large layout shifts.
- Preload only the minimal CSS/JS required for first interaction.
- Lazy-load heavy search/translation clients when the Study Sheet opens.
- Cache deterministic metadata where already supported, but never hide stale/error state.

### Accessibility

- Real anchor cards for navigation.
- Correct dialog/sheet focus trap where modal behavior exists.
- Escape/back closes the active study surface.
- Focus returns to selected text/action after close where possible.
- `aria-live` only for concise status updates, not full result streams.
- Strong contrast in every loading/error/result state.
- RTL-aware verse text and mixed bidi isolation around English labels.

## Ideal user story

A person opens Heichelos, taps anywhere on Ikar, immediately sees a compact useful Torah library, taps a section card, reads Torah, selects a phrase, opens one Study Sheet, switches among Translate / Tanach / Related without the page shifting or panels stacking, opens a verse if desired, closes the sheet, and continues reading. Global search uses the same vocabulary and result geometry. No screen feels like a different application.
