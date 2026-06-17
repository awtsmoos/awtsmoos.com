// B"H
export function manualGroupOf(def = {}) { return def.group || def.manual?.group || "ungrouped"; }
export function groupCommands(commands = []) { return commands.reduce((acc, c) => { const g = c.group || "ungrouped"; (acc[g] ||= []).push(c); return acc; }, {}); }
