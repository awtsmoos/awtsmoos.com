/* B"H
Toolbar model: commands gather at the top like tools on a craftsman's table.
*/
export function createToolbar(actions = []) { return { actions:actions.map(a => ({ id:a.id, label:a.label, enabled:a.enabled !== false })) }; }
export function enabledToolbarActions(toolbar) { return toolbar.actions.filter(a => a.enabled); }
