// B"H
export function sefirosModifierPacket(command = {}) { return { renderer:"sefiros", kind:"modifier_stack", id:command.id, modifiers:command.modifiers || [] }; }
