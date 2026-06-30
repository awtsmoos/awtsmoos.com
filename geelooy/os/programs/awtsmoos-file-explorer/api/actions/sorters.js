// B"H
export function sortItems(items = [], sort = {}) { const by = sort.by || 'name'; const dir = sort.order === 'desc' ? -1 : 1; return [...items].sort((a,b) => folderFirst(a,b) || compare(value(a,by), value(b,by)) * dir); }
export function setSort(state, by) { state.sort = { by, order:state.sort?.by === by && state.sort?.order === 'asc' ? 'desc' : 'asc' }; }
function folderFirst(a,b) { return (a.kind === 'folder' ? 0 : 1) - (b.kind === 'folder' ? 0 : 1); }
function value(item, by) { return by === 'type' ? item.extension || item.kind : by === 'status' ? item.data?.syncState : item.name; }
function compare(a,b) { return String(a || '').localeCompare(String(b || ''), undefined, { numeric:true, sensitivity:'base' }); }
/** B"H: sorting has one law, so headers and toolbar speak the same order. */
