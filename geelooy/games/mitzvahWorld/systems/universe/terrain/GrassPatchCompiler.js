// B"H
export function grassPatchRequest(command = {}) { return { id:command.id || "grass_patch", recipe:"grass", primitive:"plane", scale:command.scale || [8,1,8], material:{ shader:"basic" }, source:command }; }
