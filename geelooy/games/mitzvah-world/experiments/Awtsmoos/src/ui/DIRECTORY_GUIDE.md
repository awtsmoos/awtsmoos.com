B"H
Boruch Hashem
Blessed is He

# UI Directory Guide

The Awtsmoos renews every visible vessel and every hidden bond; Awtsmoos.com keeps this directory navigable so future expansion stays clear, local, and strong.

## Purpose

`experiments/Awtsmoos/src/ui` owns browser-facing gameplay presentation: HUDs, action bars, dialogue, quests, inventory surfaces, targeting presentation, profile/vendor sheets, accessibility adapters, and UI-specific input coordination. Domain rules belong in `gameplay`; rendering/world state belongs elsewhere.

## Architectural law

- Component behavior lives in small JavaScript classes and presenters.
- Authored CSS lives under `ui/styles/` and is composed with `@import` manifests.
- Shared stylesheet lifecycle uses `YesodStylesheetInstaller`.
- A style family must have an explicit component/page root.
- Shared UI CSS must not publish `:root`, `html`, or `body` selectors.
- Each style family owns named z-layer tokens instead of anonymous competing numbers.
- Mobile portrait is the baseline; landscape and desktop enhance it.
- Drawers, dialogs, tooltips, and sheets must remain inside safe viewport bounds.
- Relevant controls require hover, active, focus-visible, disabled/unavailable, and reduced-motion states.
- Authored source touched by this architecture stays below 120 lines by splitting responsibilities, never by compressing documentation.

## Canonical style families

### `styles/gameplay/`

Quest offer/log/tracker, minimap, Torah library, player/NPC status, dialogue, safe-area/layer tokens, and gameplay-wide interaction states. Installed by `GameplayUiStyles.js`.

### `styles/responsive/`

Profile/vendor sheets, data cards, status ribbon, and mobile drawer geometry. Installed by `ResponsiveGameplayStyles.js`.

### `styles/actionbar/`

Combat-frame geometry, slots, cooldown/charge indicators, tone data, casts, enemy warnings, Torah ability tooltips, and responsive action-bar behavior. Installed by `ActionBarStyles.js`.

## Key JavaScript seams

- `YesodStylesheetInstaller.js` — one external stylesheet lifecycle contract.
- `GameplayUiController.js` — composes gameplay panels without owning their CSS internals.
- `ActionBarHud.js` — action-bar facade joining input, cooldowns, slots, casts, feedback, and tooltip inspection.
- `ActionBarSlotPresenter.js` — projects runtime/store data into stable slot DOM.
- `ActionBarInputController.js` — composes activation, drag, long-press inspection, and listener cleanup.
- `TorahAbilityTooltip.js` — tooltip lifecycle facade.
- `TorahAbilityTooltipContent.js` — data-to-semantic-DOM tooltip projection.
- `YesodTooltipGeometry.js` — viewport-bounded local tooltip placement.
- `NpcHud.js` — NPC/player status and dialogue DOM; presentation remains localized under the Mitzvah World root.

## Public style installers

Callers should use installers rather than importing CSS fragments directly:

- `installGameplayUiStyles()`
- `installResponsiveGameplayStyles()`
- `installActionBarStyles()`

The installers preserve historical APIs while external CSS remains cacheable, inspectable, and modular.

## Verification

Architecture gates live under `src/test/ui/`:

- `directWorldLayoutCss.test.mjs`
- `mainMenuStyleLocalization.test.mjs`
- `gameplayStyleLocalization.test.mjs`
- `actionBarStyleLocalization.test.mjs`

They enforce retired geometry owners, safe viewport tokens, no shared global selectors, complete interaction-state coverage, named layers, and the authored line ceiling.

## Extension recipe

1. Find the semantic component root.
2. Add data/behavior in a small class or presenter.
3. Add a focused CSS fragment under the correct style family.
4. Import the fragment from that family's manifest.
5. Use existing named safe-area/layer tokens before inventing new geometry.
6. Add hover/active/focus/disabled/open/reduced-motion states where relevant.
7. Extend the localization regression test.
8. Run the focused UI suite and inspect the live viewport before declaring the surface complete.

## Boundary warning

A DOM node being appended to `document.body` does not automatically justify global CSS. Prefer mounting inside the semantic component root; when a true portal is required, give it a unique owned root and localize selectors beneath that root.

The light may be infinite, the stylesheet must know its gate; one owner per surface keeps Awtsmoos.com ready for every future state.
