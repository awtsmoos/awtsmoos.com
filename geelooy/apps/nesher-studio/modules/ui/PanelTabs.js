/* B"H
Panel tabs: mobile panels become a clean sequence instead of a cramped wall.
*/
export function createPanelTabs(ids = []) { return { ids, active:ids[0] || null }; }
export function activatePanelTab(tabs, id) { if (tabs.ids.includes(id)) tabs.active = id; return tabs.active; }
