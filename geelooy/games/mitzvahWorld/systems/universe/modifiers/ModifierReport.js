// B"H
export function modifierReport(commands = []) { return { commands:commands.length, withModifiers:commands.filter(c => c.modifiers?.length).length, expandedArrays:commands.filter(c => c.arrayIndex !== undefined).length }; }
