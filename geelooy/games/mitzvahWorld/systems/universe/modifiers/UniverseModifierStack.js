// B"H
export function modifierStackOf(source = {}) { return Array.isArray(source.modifiers) ? source.modifiers : []; }
export function withModifierStack(command = {}, source = {}) { return { ...command, modifiers:modifierStackOf(source) }; }
