<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Final File Plan — Massive Responsive Experience Pass

## Evidence-based diagnosis

The application already contains a mobile scene system, but the interaction contract is incomplete: scene buttons are bound in more than one place, drawers have no focus policy, Escape behavior is absent, and mobile state is conveyed mainly through classes rather than synchronized ARIA. The final cascade also contains a deliberately late `css/ai-chat/` layer whose files are tiny, compressed, and visually inconsistent with the more mature ideal modules. That late layer is the correct place to unify the experience without destabilizing the established renderer, automation engine, or protected mobile overlap seal.

## JavaScript files to create

- `js/app/mobileWorkspaceFocus.js`: focus entry/return, inert state, and ARIA synchronization for mobile scenes.
- `js/app/mobileWorkspaceElements.js`: scene metadata, trigger lookup, and a single dynamically created close control.

## JavaScript files to rewrite completely

- `js/app/mobileDrawers.js`: one stateful controller for mobile scenes, Escape, conversation selection, resize transitions, and public compatibility exports.
- `js/app/mobileChrome.js`: accessible crown collapse state with synchronized labels and expanded state.

## CSS files to rewrite completely

The already-active final experience layer under `css/ai-chat/`:

- `index.css`: ordered focused manifest.
- `tokens.css`: semantic color, spacing, typography, surface, and motion tokens.
- `shell.css`: desktop workspace proportions and panel hierarchy.
- `sidebar.css`: conversation navigation and provider setup.
- `messages.css`: readable message content, code, tables, links, and role distinction.
- `composer.css`: desktop and mobile speech gate.
- `buttons.css`: consistent interaction states and touch targets.
- `providers.css`: provider/model/status controls.
- `states.css`: loading, empty, error, success, and automation status.
- `focus-motion.css`: focus visibility, reduced motion, and high-contrast resilience.
- `mobile.css`: single-canvas mobile scenes, crown, dock, safe areas, and panel readability.

## CSS files to create

- `css/ai-chat/automation.css`: structured automation cards, labels, controls, and section rhythm.
- `css/ai-chat/navigation.css`: crown, dock, panel topbars, and active-destination language.
- `css/ai-chat/responsive.css`: tablet, laptop, desktop, ultrawide, short-height, and large-text refinements.

## Tests to create

- `tests/mobileWorkspaceState.test.mjs`: observable scene, focus, ARIA, and Escape contracts using a small DOM fixture when available, plus pure metadata assertions.
- `tests/uiExperienceSource.test.cjs`: manifest order, required semantic selectors, touch targets, code/table overflow, safe-area tokens, and absence of forceful declarations.

## Verification

1. Full syntax checks for touched JavaScript.
2. Focused tests plus existing CSS, overlap, mobile, static, and live UI harnesses.
3. A deterministic browser fixture that loads the real cascade without application network boot.
4. Geometry and screenshots at 390×844, 768×900, 1280×800, 1440×900, and 1920×1080.
5. Mobile scene switching, Escape, focus return, crown collapse, safe-area composer, no horizontal overflow, and desktop center-width assertions.
6. Full readback, tab-indentation scan, line counts, `git diff --check`, planned-versus-actual report, and final remaining-work ledger.
