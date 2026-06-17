// B"H
export function branchHouseMeshRequest(command = {}) { return { id:command.id, recipe:"branch_house", primitive:"branch_house", scale:command.manual?.transform?.scale || [4,3,4], material:{ shader:"basic" }, source:command }; }
