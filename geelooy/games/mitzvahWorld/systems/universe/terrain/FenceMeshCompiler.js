// B"H
function dist(a=[0,0,0], b=[1,0,0]) { return Math.hypot((b[0]-a[0]), (b[1]-a[1]), (b[2]-a[2])); }
export function fenceMeshRequest(command = {}) { return { id:command.id, recipe:"fence", primitive:"box", scale:[dist(command.from, command.to),1,.2], material:{ shader:"basic" }, source:command }; }
