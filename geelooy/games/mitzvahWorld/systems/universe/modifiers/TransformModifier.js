// B"H
export function applyTransformModifier(command, modifier = {}) { return { ...command, transformModifier:{ position:modifier.position || modifier.translation || [0,0,0], rotation:modifier.rotation || [0,0,0], scale:modifier.scale || [1,1,1] } }; }
