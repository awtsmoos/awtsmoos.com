B"H

# Mobile/desktop sidebar verification + lightning resize plan

## Inspected
- `tabs/draggable.js` still schedules a fresh `requestAnimationFrame` on every pointermove with no coalescing guard. That can queue extra frames and feel choppy during resize.
- It also calls `performGeometricCheck()` immediately on pointerup, which can make release feel sticky.
- `forever-ui-fixes.css` owns the final ideal UI layer and currently has no duplicate selectors.

## Fix now
1. Rewrite `tabs/draggable.js` completely with coalesced pointer updates: one RAF max, latest pointer coordinates only.
2. No expensive geometry during active resize. On release, schedule geometry through idle/frame.
3. Add explicit mobile/desktop final CSS sections so sidebar is clearly different and better on both:
   - desktop: right dark inspector panel, fixed width, fast transform, no heavy shadows during resize.
   - mobile: bottom drawer, rounded top, max-height, safe-area spacing, fast transform.
4. Verify `node --check`, tests, and CSS duplicate selectors again.

No partial patching. Every modified file is rewritten whole.
