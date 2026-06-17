// B"H
export function mountainMeshRequest(command = {}) { return { id:command.id, recipe:"mountain", primitive:"mountain", scale:[command.radius || 20, command.height || 20, command.radius || 20], material:{ shader:"basic" }, source:command }; }
