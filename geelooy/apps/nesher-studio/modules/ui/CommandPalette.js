/* B"H
Command palette: hidden power becomes searchable speech.
*/
export function createCommandPalette(commands = []) { return { commands }; }
export function searchCommands(palette, query = '') { const q = query.toLowerCase(); return palette.commands.filter(c => `${c.id} ${c.label}`.toLowerCase().includes(q)); }
