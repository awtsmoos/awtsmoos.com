// B"H
export function rockMeshRequest(command = {}) { return { id:command.id, recipe:"rock", primitive:"sphere", scale:command.scale || [1,1,1], material:{ shader:"basic" }, source:command }; }
