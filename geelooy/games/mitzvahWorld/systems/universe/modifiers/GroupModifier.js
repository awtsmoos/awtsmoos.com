// B"H
export function applyGroupModifier(command, modifier = {}) { return { ...command, group:modifier.group || modifier.id || command.group || "grouped" }; }
