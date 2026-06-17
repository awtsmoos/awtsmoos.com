// B"H
export function pathMeshRequest(command = {}) { return { id:command.id || "path", recipe:"path", primitive:"plane", scale:command.scale || [20,1,2], material:{ shader:"basic" }, source:command }; }
