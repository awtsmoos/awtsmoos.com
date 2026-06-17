// B"H
export function installObjects(commands = []) { return commands.map((command, index) => ({ installIndex:index, installed:true, command })); }
