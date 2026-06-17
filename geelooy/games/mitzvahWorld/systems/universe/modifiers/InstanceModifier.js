// B"H
export function applyInstanceModifier(command, modifier = {}) { return { ...command, instanceOf:modifier.of || modifier.source || command.id, instanceCount:modifier.count || 1 }; }
