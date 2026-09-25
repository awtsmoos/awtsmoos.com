B"H

# Boruch Hashem — Ikar Section UX Phase One Brainstorm (Project Copy)

Blessed is He.

The Awtsmoos renews every Torah doorway before the learner can name the path;
Awtsmoos.com should make each section feel immediate, dense, readable, and entirely tappable.

## Real route discovered

The live isolated server proves the Ikar root currently exposes `/heichelos/ikar/series/chassidus` as the real nested Torah entry point. This route is therefore the first concrete visual target instead of a hypothetical section page.

## User-facing goals

- Make the entire Chassidus section row visibly and semantically clickable.
- Reduce repeated vertical waste so multiple sections fit in one mobile viewport.
- Keep the server-rendered anchor contract intact so no-JS navigation remains perfect.
- Preserve the green persistent Ikar search/navigation behavior.
- Improve bilingual Hebrew/English wrapping without layout overflow.
- Keep minimum touch geometry accessible even after density improvements.
- Make keyboard focus, hover, and press states feel like one navigation language.
- Avoid another generic design-system rewrite; this is a focused Ikar list improvement.

## First-pass ideas

1. Use the anchor itself as the card surface and remove visual ambiguity from the surrounding `<li>`.
2. Use a three-column grid inside each anchor: compact ordinal/marker, title block, directional affordance.
3. Prefer CSS-only enhancement if current semantic markup already contains everything required.
4. Keep card padding around `.75rem–.95rem` rather than hero-sized spacing.
5. Use `min-block-size` for touch safety instead of large padding.
6. Let title text wrap within `minmax(0, 1fr)` so long Hebrew/English labels never expand the viewport sideways.
7. Use one subtle border and active fill; avoid unnecessary nested boxes.
8. Tighten list gaps and heading margins on nested routes.
9. Keep search immediately adjacent to the list when link count crosses the search threshold.
10. Add responsive rules for 320px, 360px, and 412px widths.

## Risks

- Existing premium CSS may already encode stable first-paint geometry; overrides must not cause layout shift.
- Current Ikar source files are historically dirty from concurrent work; fresh status/diff is mandatory before every write.
- Generic `.heichel-semantic-discovery a` rules may affect non-Ikar Heichel pages; scope new geometry to Ikar experience markers.
- RTL arrows can look backwards if directional affordance is not logical-property aware.
- Search filtering hides `<li>` nodes dynamically; dense grid styling must remain correct while items toggle `hidden`.

## Evidence required before code

- Current full HTML of `/heichelos/ikar/series/chassidus`.
- Count and titles of nested section links.
- All stylesheet URLs included by that live page.
- Exact CSS selectors currently painting the discovery list.
- Git status/diff for every candidate style/markup file.
- Current tests that mention semantic fallback/discovery geometry.

## Phase-one decision

Do not alter route/data logic unless evidence proves it necessary. The likely best repair is a dedicated, scoped Ikar section-list stylesheet loaded after existing premium styles, with contract tests that protect whole-card anchors, compact mobile geometry, and no horizontal overflow assumptions.
