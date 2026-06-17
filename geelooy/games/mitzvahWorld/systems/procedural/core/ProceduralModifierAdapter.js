// B"H
export function adaptModifiers(modifiers = []) { return modifiers.map((m, index) => ({ index, type:m.type || "unknown", params:{ ...m } })); }
