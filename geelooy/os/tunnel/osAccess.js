// B"H
export function currentOs() { return window.os || {}; }
export function currentGraph() { return currentOs().graph || {}; }

/** B"H: access helpers keep handlers from chanting window.os again and again. */
