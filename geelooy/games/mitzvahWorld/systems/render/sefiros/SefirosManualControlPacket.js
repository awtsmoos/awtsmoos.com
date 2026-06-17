// B"H
export function sefirosManualControlPacket(command = {}) { return { renderer:"sefiros", kind:"manual_control", id:command.id, manual:command.manual || {}, group:command.group || "ungrouped" }; }
