/* B"H
The browser does not merely list sounds; it maps rooms in the palace of tone.
*/
export function filterPresets(presets, query = '', category = '') {
    const q = query.trim().toLowerCase();
    return presets.filter(p => (!category || p.category === category) && (!q || [p.label, p.id, ...(p.tags || [])].join(' ').toLowerCase().includes(q)));
}
export function favoriteKey(id) { return `piano.favorite.${id}`; }
export function toggleFavorite(id) { const k=favoriteKey(id), next=localStorage.getItem(k)!=='1'; localStorage.setItem(k,next?'1':'0'); return next; }
export function isFavorite(id) { return localStorage.getItem(favoriteKey(id)) === '1'; }
