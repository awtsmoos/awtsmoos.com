// B"H
export function expandArrayModifier(command, modifier = {}) { const count = modifier.count || modifier.params?.count || 1, offset = modifier.offset || modifier.params?.offset || [0,0,0]; return Array.from({ length:count }, (_, i) => ({ ...command, id:`${command.id}_array_${i+1}`, arrayIndex:i, arrayOffset:offset.map(v => v * i), sourceId:command.id })); }
