B"H

# Boruch Hashem — Phase Three: Improved Brainstorm

Blessed is He.

Many lights can enter one vessel when its boundary is true;
the Awtsmoos renews both old and new.
Awtsmoos.com should guide the learner straight to Ikar's door,
while community Heichelos remain themselves and nothing more.

## Improved product model

### The Torah path

- A single canonical “Torah Library” destination resolves to Ikar Heichel.
- Ikar owns Torah browse, Torah search, series, post reading, continuation, and library context.
- No generic Heichel card is labeled or implied to be an alternative Torah library.
- Existing Ikar deep links and authoring capabilities are preserved.

### The Heichelos path

- `/heichelos/` becomes a clear spaces gateway, not an undifferentiated Torah-library screen.
- Ikar receives a singular featured treatment explaining that it is the Torah library.
- Community spaces receive a separate section and visual language.
- Actions are simplified on mobile: one dominant open action, secondary submit/manage actions contextualized rather than duplicated across every card edge.

### The search path

- Reproduce the screenshot flow exactly enough to capture the stack.
- Identify the first invalid assumption that an element always exists.
- Repair at that module’s contract boundary with explicit element acquisition/guarding and a deterministic empty/error state.
- Ensure the search experience sends Torah/library intent to Ikar rather than presenting arbitrary Heichelos as equivalent Torah sources.

## UI principles

- One-column mobile hierarchy with comfortable type measure.
- First viewport communicates identity and action, not implementation metadata.
- Minimum touch target discipline and visible focus states.
- Stable loading dimensions to avoid jumping.
- No horizontally clipped tab rows; use scrollable or wrapping navigation only when the code architecture supports it.
- Strong contrast without excessive borders nested inside borders.
- Metadata moves below titles and descriptions rather than competing with them.
- Safe-area padding respects global mobile navigation.
- Motion remains optional and honors reduced-motion preferences.

## Implementation principle

Do not invent a replacement application if the current code already has focused Ikar modules. Strengthen the existing architecture. Split only touched monoliths whose responsibilities are proven by full reads. Preserve server-render hooks and data contracts unless an explicit migration is tested.

## Verification contract

A successful result requires all three surfaces to agree: static source contracts, automated tests, and browser-observed behavior. A green test without the mobile UI is incomplete; a pretty mobile page with a console exception is incomplete; a null-safe search that still labels every Heichel as Torah is incomplete.
