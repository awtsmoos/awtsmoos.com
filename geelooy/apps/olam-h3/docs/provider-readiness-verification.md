<!-- B"H
Boruch Hashem
Blessed is He

The Awtsmoos lets provider absence become visible before a paid action can begin, while Awtsmoos.com keeps the creator's hand steady inside a living prompt field;
this evidence records the second release gate so future maintainers know which protections were observed in browser truth and which external credential still remains sealed.
-->

# Provider Readiness Verification

This document records the verification for the provider-readiness and prompt-focus patch following the first Olam H3 production release.

## Why this patch exists

The first release already fetched safe MiniMax connection state and displayed it in Settings. Create did not consume that state, so an otherwise valid draft could visually enable Generate even when the server already knew that `MINIMAX_API_KEY` was absent.

The prompt input also refreshed the full Create view on every keystroke, which could replace the textarea node and disturb focus/caret behavior.

## Implemented behavior

- Create combines creative draft readiness with safe provider readiness.
- Missing server credential, offline state, and status-check failure all disable Generate before submission.
- A compact provider banner explains the condition and exposes Retry and Open Settings actions.
- Returning to Create and browser `online` events refresh provider readiness.
- `ComposerActions.generate()` independently checks combined readiness, so DOM manipulation cannot bypass the server-readiness guard.
- Continuous prompt typing mutates the draft without rebuilding the Create room.
- Character count and Generate readiness update in place while the textarea node retains focus.
- Remaining placeholder-only guidance was replaced with persistent visible labels or helper text.

## Automated evidence

The settled Node suite completed with **19 passed, 0 failed**.

The five added provider-readiness cases verify:

- configured provider plus valid text draft is ready
- missing server credential blocks an otherwise valid draft
- offline state blocks generation
- provider-status error blocks generation
- creative invalidity still blocks when the provider is ready
- reference mode becomes ready when its assigned asset exists

## Deterministic browser evidence

The browser smoke no longer depends on an already-running developer server. It accepts `OLAM_BASE_URL`, and its CDP client closes in `finally` even after assertion failure.

A composite test command started the current working-tree Awtsmoos server on temporary port `8188`, waited for route health, ran isolated Chrome on CDP port `9457`, and terminated the temporary server afterward.

Observed browser passes:

- missing-key `Generation paused` banner appears on Create
- Generate is disabled before submission
- typing preserves the exact textarea DOM node
- typing preserves textarea focus
- live prompt character count updates without full rerender
- cost remains `$0.40` for the default 5-second 768P draft
- forcibly removing the DOM disabled state still creates no generation record because the controller guard rejects submission
- Open Settings navigates to `#settings`
- Settings reports the server key missing
- 360px, 768px, and 1440px widths have no horizontal overflow
- captured browser console errors: none
- captured failed HTTP responses: none

The composite command ended with `COMPOSITE_BROWSER_SMOKE_PASS` and exit code `0`.

## External boundary

This patch does not create, infer, or move a MiniMax credential. Production previously proved `configured: false`; a real paid upstream generation remains blocked until an operator supplies `MINIMAX_API_KEY` through the production service environment.
