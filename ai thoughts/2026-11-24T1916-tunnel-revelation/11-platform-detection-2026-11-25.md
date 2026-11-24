# B"H — Tunnel Revelation Run 11: platform detection label/tab mismatch — 2026-11-25

Scope: `geelooy/apps/tunnel` ONLY. Minor defect from rendered verification:
the page text said "Detected platform tab: Mac / Linux" while the
PowerShell tab was the selected install tab on first load.

## Root cause — two drivers, order-dependent, disagreeing
1. `js/onboarding.js` self-mounts as its own `<script type=module>` tag
   BEFORE `js/main.js` executes, and `mountOnboarding()` preselected the
   tab by calling `tabButton.click()`. But the click only switches tabs
   via `activateTab()` in `js/ui.js`, whose listeners are bound later by
   `mountTabs()` in main.js — so the synthetic click was a no-op. The
   dataset guard then blocked main.js's second `mountOnboarding()` from
   ever re-trying. The hardcoded PowerShell default in the HTML survived.
2. The label was set unconditionally from a separate lumped regex
   (`/Mac|Linux|X11/` → "Mac / Linux") in the same function — computed
   independently of whether the tab actually switched. Hence a Mac/Linux
   label sitting over a selected PowerShell tab.

## Fix (`js/onboarding.js`, pin bumped to `dadde35f95`)
- One pure exported `detectPlatform(ua)` returns a single result
  `{id, platform, tab, tabName, note}`. Windows → powershell /
  "Windows PowerShell (detected: Windows)"; macOS → unix /
  "Mac / Linux (detected: macOS)"; Linux → unix /
  "Mac / Linux (detected: Linux)"; unknown → powershell default with an
  honest label ("Platform not detected — Windows PowerShell tab shown
  by default"). `detectInstallTab(ua)` kept as a back-compat wrapper.
- `mountOnboarding()` now applies that same result directly to the DOM
  (`selectInstallTab`: toggles `active`/`aria-selected` on `[data-tab]`
  and `active` on `[data-pane]`, exactly as `activateTab` does) instead
  of a synthetic click — order-independent of the ui.js wiring — and
  prints `detected.note` as the label. Label and tab come from the one
  object, so they cannot disagree. The inline fallback chooser in
  index.html sets no platform label, so it can never print a wrong one.

## Proof
- New `js/test/platformDetection.test.mjs`: UA stubs for Windows /
  macOS / Linux Chrome + unknown bot, each starting from a WRONG active
  tab (cmd) so a pass proves detection drove the selection. Asserts
  exactly one active tab and pane, both == detected tab, and the label
  names that same tab (and the detected platform, or "not detected").
  PASS for all 4 cases; FAILS against the pre-fix onboarding.js
  (no detectPlatform, click-based preselection).
- No regressions (type:module sandbox, the in-repo ESM harness quirk is
  pre-existing): `onboardingChooser.test.mjs` PASS,
  `test/chooserResilience.test.cjs` PASS, `inlineLinkGold` PASS,
  `indexHtml` PASS. Beauty CSS untouched.
- Served live (static working tree): index pin `dadde35f95` == file
  sha256 prefix, onboarding.js 200 with the new code, mode 644.

Rollback: `git revert <run-11 commit>`.
