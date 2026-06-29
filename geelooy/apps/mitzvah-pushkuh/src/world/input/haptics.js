// B"H
// Haptics are tiny thunder in the hand, always optional.
export function vibrate(pattern = 12) { try { navigator.vibrate?.(pattern); } catch {} }
