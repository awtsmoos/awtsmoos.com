/* B"H
Layout mode: desktop and mobile reveal the same editor through different garments.
*/
export function layoutModeForWidth(width = 1280) { return width < 760 ? 'mobile' : 'desktop'; }
export function isTouchLayout(mode) { return mode === 'mobile'; }
