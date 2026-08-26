B"H
Boruch Hashem
Blessed is He

# Milestone 5B — Extreme API/CSS File Map and Critique

The Awtsmoos is infinite simplicity, yet creation appears through ordered worlds. The browser should mirror that paradox: a tiny API surface producing an elaborate interface, with every added capability balanced by explicit Gevurah.

## Files to add

### `ui/hostDomSpec.js`
Pure validation and normalization for declarative host DOM specs.

Responsibilities:
- validate tag/ref/class/text/attributes/properties/dataset/children,
- reject event-handler strings and innerHTML-like fields,
- normalize scalar and array class declarations,
- remain DOM-free and easy to unit test.

### `ui/hostDomRender.js`
Recursive renderer for trusted host UI specs.

Responsibilities:
- manifest one normalized spec into the supplied Document,
- recursively render children,
- collect `ref` names into a Map-like object,
- set attributes/properties/dataset without eval,
- return `{ malchusNode, yesodRefs }`.

### `ui/hostDomActions.js`
Host-only action binding.

Responsibilities:
- bind declared action names to injected handler maps,
- refuse unknown actions,
- return cleanup functions,
- never accept code strings.

### `ui/browserElementGrammar.js`
Reusable frozen data fragments for common controls.

Responsibilities:
- button grammar,
- text input grammar,
- section grammar,
- accessibility defaults,
- no DOM side effects.

## Files to rewrite around declarative data

### `browserChrome.js`
Mostly data.

Named refs:
- `keterToolbar`,
- `chochmahTabStrip`,
- `tiferesActiveTab`,
- `hodTabTitle`,
- `netzachNewTab`,
- `gevurahNavigation`,
- `yesodNavigationActions`,
- `malchusOmnibox`,
- `hodTrustMarker`,
- `yesodAddress`,
- `hodModeBadge`,
- `gevurahAdvancedToggle`,
- `netzachProgress`.

No normal/bored helper variables.

### `browserViewport.js`
Declarative structure plus one small state controller.

Refs:
- `malchusViewport`,
- `yesodPageHost`,
- `hodEmptyState`,
- `binahDeveloperStage`,
- `chochmahGlCanvas`,
- `malchusTextCanvas`.

### `browserDeveloperTools.js`
Pure data + refs; no repetitive element factory.

### `browserAdvancedPanel.js`
Composition only:
- session section,
- imported developer-tool spec,
- open/close state.

### `remoteSurface.js`
Mostly declarative data for nav/session control specs.

### `surface.js`
Tiferes compositor:
- renders chrome/viewport/advanced specs,
- groups contract by architecture,
- provides temporary flat aliases for legacy callers.

## CSS file graph

`style.css` contains imports only.

`styles/tokens.css`
- component-scoped custom properties on `.awtsmoos-browser-host`,
- spacing, radii, type scale, motion durations, shadows, z-index layers,
- no element selectors.

`styles/shell.css`
- host/root/body boundaries,
- sizing and overflow law,
- no global reset.

`styles/chrome.css`
- tab strip,
- omnibox,
- trusted badges,
- primary nav,
- progress rail.

`styles/viewport.css`
- page host,
- iframe,
- empty state,
- developer renderer.

`styles/advanced.css`
- drawer,
- sections,
- editor,
- diagnostics.

`styles/remote.css`
- host navigation buttons,
- alias/jar inputs,
- session status.

`styles/motion.css`
- keyframes only,
- state transition classes,
- reduced-motion override.

`styles/responsive.css`
- mobile-first enhancement breakpoints,
- container-style behavior where supported,
- hard overflow safety.

## Interaction-state matrix

Every actionable host element must specify:

| Element | hover | active | focus-visible | disabled | loading/open |
|---|---|---|---|---|---|
| tab | yes | yes | yes | n/a | active |
| new-tab | yes | yes | yes | yes | n/a |
| nav button | yes | yes | yes | yes | loading where applicable |
| omnibox | parent hover | n/a | focus-within | n/a | loading |
| advanced toggle | yes | yes | yes | yes | open |
| session input | border glow | n/a | focus-visible | yes | invalid |
| tool button | yes | yes | yes | yes | pending |

No interaction may change geometry enough to shift neighbors unexpectedly.

## Overflow / collision audit rules

1. Root uses `width: 100%; height: 100%; min-width: 0; min-height: 0; overflow: hidden`.
2. Every flex/grid text-bearing child that can shrink uses `min-width: 0`.
3. Omnibox uses `flex: 1 1 auto` and `min-width: 0`.
4. Tab title truncates with ellipsis.
5. Drawer uses bounded inline size and internal scrolling.
6. Viewport owns overflow clipping.
7. Iframe uses `display:block; width:100%; height:100%; border:0`.
8. No absolute-positioned interactive control may escape trusted chrome.
9. Narrow layouts stack session controls vertically before they overflow.
10. Wordmark and optional labels disappear before core controls compress below touch-safe size.

## Twenty-plus explicit improvements over the first shell draft

1. Replace imperative DOM construction with validated data specs.
2. Split rendering from validation.
3. Split action binding from rendering.
4. Refuse `innerHTML` in host UI grammar.
5. Refuse string event handlers.
6. Collect refs systematically instead of manually returning each local variable.
7. Group returned API handles by architecture.
8. Keep legacy aliases only at the compatibility edge.
9. Replace generic helper names with semantically mapped Sefiros names.
10. Expand every helper JSDoc to full contract documentation.
11. Move CSS custom properties from `:root` to `.awtsmoos-browser-host`.
12. Make `style.css` import-only.
13. Make all component selectors host-scoped.
14. Build mobile-first rather than desktop-first media overrides.
15. Define hover/active/focus/disabled states for every actionable control.
16. Add `prefers-reduced-motion` handling.
17. Use animation-safe properties and avoid layout-jank transitions.
18. Add explicit min-width/min-height overflow laws.
19. Use data/state attributes for mode/loading/open styling.
20. Prevent structural new-tab affordance from pretending full multi-tab support exists.
21. Make mode badge state data-driven instead of hard-coded `Local`.
22. Make progress state controlled by host attributes/classes rather than ad-hoc inline styles.
23. Preserve developer tools but make them explicitly secondary.
24. Keep host chrome visually impossible for guest iframe content to overlap.
25. Add unit tests for the generic DOM interpreter itself.
26. Add contract tests proving unknown action names fail closed.
27. Add style-source tests that forbid unscoped selectors in component files.
28. Add a DOM layout smoke test for narrow host widths.
29. Add browser-preview inspection for overlap/overflow after JS tests.
30. Keep each file under 120 lines by adding modules, never shrinking documentation.

## Critical critique

The first shell pass improved hierarchy, but its implementation still resembled handcrafted UI code. Repeating `createElement`, manually setting attributes, and returning bags of local variables will scale poorly when tabs, permissions, history, downloads, and security popovers arrive.

The revelation is that the browser needs a tiny declarative host UI substrate now, before more features make imperative structure expensive to unwind.

This substrate must stay intentionally small. We are not building React inside Awtsmoos Browser. We are building a constrained, host-trusted JSON-to-DOM interpreter with explicit validation and cleanup semantics.
