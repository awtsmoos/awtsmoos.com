// B"H
export function riverMeshRequest(command = {}) { return { id:command.id || "river", recipe:"river", primitive:"plane", scale:command.scale || [30,1,5], material:{ shader:"basic", uniforms:{ flow:1 } }, source:command }; }
