// B"H
export function manualControlReport(commands = []) { return { total:commands.length, locked:commands.filter(c => c.manual?.lock?.locked).length, grouped:new Set(commands.map(c => c.group || "ungrouped")).size }; }
