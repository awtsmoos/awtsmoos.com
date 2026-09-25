B"H

# Boruch Hashem — Phase One: Chesed Brainstorm

Blessed is He.

From hidden possibility the many paths arise;
the Awtsmoos renews the map beneath our eyes.
On Awtsmoos.com the library should feel like one bright door,
not scattered Torah signs across an uncertain floor.

## Unbounded product possibilities

- Make Ikar Heichel the unmistakable canonical Torah library.
- Turn `/heichelos/` from a flat card list into a purposeful gateway: Ikar for Torah, community spaces for community life.
- Give Ikar a compact mobile hero with title, purpose, search, recent learning, and clear browse paths.
- Preserve deep links into existing series/posts while improving discovery.
- Add a Torah-focused search entry that searches Ikar content first and labels scope clearly.
- Remove duplicate or ambiguous “library” affordances that imply multiple Torah libraries.
- Make community Heichelos visually distinct from Torah-library content.
- Use progressive disclosure so mobile users see meaning before metadata.
- Replace tiny/fragile touch targets with accessible controls.
- Keep navigation stable while data loads to prevent layout jumping.
- Provide resilient empty/error/loading states rather than broken cards.
- Give search graceful recovery when optional DOM elements are absent.
- Keep Ikar fast by rendering a light shell before heavy enhancements.
- Surface series, recent posts, and continuation paths without overwhelming the first viewport.
- Let desktop gain density while mobile remains single-column and readable.
- Preserve author/editor/admin functionality behind contextual controls rather than crowding public reading UI.
- Establish a reusable Heichel gateway card model for non-Torah spaces.
- Keep search semantics explicit: Torah results come from Ikar; people/community spaces are separate scopes.
- Add browser-level regression checks for the two screenshot failures.
- Add code-level tests for canonical Ikar routing and null-safe DOM behavior.

## Failure map

- Generic Heichelos listing may encode submission/admin behavior that must survive redesign.
- Route templates may be server-rendered and require existing class/id hooks.
- Ikar may depend on global styles; replacing them carelessly could break post/series pages.
- Search crash may live outside `geelooy/heichelos`; changing only Heichel code could leave the screenshot failure intact.
- Redirecting too aggressively could make community Heichelos undiscoverable.
- Duplicating Ikar UI into `/heichelos/` would create two Torah libraries, violating the product intent.
- Mobile sticky bars may collide with global navigation/safe-area insets.
- Existing tests may assert precise HTML hooks and data attributes.

## Ideal outcome

The user lands on Awtsmoos.com and feels one coherent Torah civilization: Ikar is the Torah library, community Heichelos are clearly social/community vessels, search never collapses because an optional element is absent, and the mobile UI reads as intentional rather than accumulated.
