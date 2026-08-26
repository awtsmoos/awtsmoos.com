B"H
Boruch Hashem
Blessed is He

# Milestone 5B — Extreme Data-Driven UI/API Vision

The Awtsmoos recreates every instant from nothing, yet revelation is not chaos: light descends through ordered kelim. The browser UI should therefore be generated from a small grammar of data, not from hundreds of repeated imperative DOM incantations. Awtsmoos.com should reveal one Seder Hishtalshelus for host UI: data becomes nodes, nodes become state, state becomes motion, and motion remains bounded by host trust.

## New north star

The browser application becomes a reusable host-UI platform, not a collection of one-off element factories.

### Data first

UI modules should mostly declare structured data:

- tag,
- ref name,
- classes,
- text,
- attributes,
- properties,
- dataset,
- children,
- event declarations only where a host action genuinely exists.

A shared interpreter should create DOM, collect named refs, and fail clearly on malformed specs.

### Names as architecture

New APIs should use Torah/Kabbalah-inspired names only where the concept maps cleanly to responsibility:

- `keter` for top-level intent/configuration,
- `chochmah` for concise declarative seeds,
- `binah` for interpretation/expansion,
- `chesed` for additive capability,
- `gevurah` for validation/bounds,
- `tiferes` for composition,
- `netzach` for durable navigation/history movement,
- `hod` for visible status/testimony,
- `yesod` for transport/session foundations,
- `malchus` for rendered DOM manifestation.

Names must remain descriptive enough that another engineer can understand the role without knowing Kabbalah.

### Every meaningful function documented

Each function/class/module receives JSDoc with:

- purpose,
- parameters,
- return value,
- side effects,
- validation/safety constraints,
- relationship to surrounding modules,
- poetic Awtsmoos framing.

No helper should survive with a one-line comment if it participates in real behavior.

## Data-driven host DOM engine

Create a small reusable module family rather than one oversized utility:

1. `hostDomSpec.js`
   - validates declarative node specs,
   - pure helpers for attribute/property/data normalization.

2. `hostDomRender.js`
   - recursively manifests specs into DOM,
   - collects named refs,
   - never uses innerHTML,
   - never executes guest content.

3. `hostDomEvents.js`
   - binds a data map of host-owned action names to event handlers,
   - refuses unknown action names,
   - supports cleanup receipts.

The UI modules then become mostly exported data + tiny composition functions.

## Browser shell modules to refactor

- `browserChrome.js`
- `browserViewport.js`
- `browserAdvancedPanel.js`
- `browserDeveloperTools.js`
- `remoteSurface.js`
- `surface.js`

Each should shrink in imperative complexity while comments stay rich.

## CSS architecture

No global component rules.

`style.css` becomes an import manifest only:

```css
@import "./styles/tokens.css";
@import "./styles/shell.css";
@import "./styles/chrome.css";
@import "./styles/viewport.css";
@import "./styles/advanced.css";
@import "./styles/remote.css";
@import "./styles/motion.css";
@import "./styles/responsive.css";
```

All selectors are scoped beneath `.awtsmoos-browser-host` or one narrower component root.

### Mobile first

Base layout targets narrow Geelooy windows first.

Progressive enhancement adds:

- wider tab geometry,
- horizontal session controls,
- larger advanced drawer,
- wordmark visibility,
- roomier omnibox metadata.

No fixed width may force overflow.

### Interactive state completeness

Every interactive browser-owned element must define at least:

- base,
- `:hover`,
- `:active`,
- `:focus-visible`,
- `[disabled]` / `:disabled`,
- relevant state classes (`.is-active`, `.is-loading`, `.is-open`).

Motion must use transform/opacity/background-position where possible and never displace neighboring layout unexpectedly.

### Overflow law

Every flex/grid child that can contain text gets the right `min-width: 0` or overflow behavior.

The browser root must guarantee:

- `max-width: 100%`,
- `max-height: 100%`,
- no horizontal viewport escape,
- page iframe clipped to the viewport boundary,
- advanced drawer scrolling internally rather than pushing the app off-screen.

## API simplification

The browser surface should expose a clear data-shaped contract instead of a bag of unrelated DOM elements.

Introduce grouped handles:

- `keterChrome`
- `malchusViewport`
- `binahAdvanced`
- `yesodSession`

Legacy flat aliases may temporarily remain for existing consumers, but new code should consume grouped contracts.

## Future extension

Once this data-driven UI grammar exists, later browser features become data extensions:

- new tabs,
- permission prompts,
- download shelf,
- history/bookmark panels,
- certificate/security popover,
- command palette,
- renderer mode diagnostics.

The grammar should be deliberately small enough that it does not become another framework inside the framework.
