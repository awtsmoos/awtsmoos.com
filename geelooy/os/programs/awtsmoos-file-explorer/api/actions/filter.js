// B"H
export function applyFilter(items = [], query = '') { const q = String(query || '').trim().toLowerCase(); return q ? items.filter(item => [item.name,item.extension,item.kind,item.mount?.badge,item.data?.syncState].some(v => String(v || '').toLowerCase().includes(q))) : items; }
export function setFilter(state, query = '') { state.filter = String(query || ''); }
/** B"H: filter turns typing into a lantern over the file field. */
