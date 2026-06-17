// B"H
export function treeMeshRequest(command = {}) { return { id:command.id, recipe:"tree", primitive:"tree", scale:command.manual?.transform?.scale || [1,4,1], material:{ shader:"bark" }, source:command }; }
