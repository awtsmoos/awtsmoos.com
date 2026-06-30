// B"H
export function createDesktopSelection(surface) {
  const selected = new Set();
  function sync() { surface.querySelectorAll('.desktop-icon').forEach(node => node.classList.toggle('selected', selected.has(node.dataset.id))); }
  function select(id, additive = false) { if (!additive) selected.clear(); if (id) selected.add(id); sync(); }
  function toggle(id) { selected.has(id) ? selected.delete(id) : selected.add(id); sync(); }
  function clear() { selected.clear(); sync(); }
  function replace(ids) { selected.clear(); ids.filter(Boolean).forEach(id => selected.add(id)); sync(); }
  function ids() { return [...selected]; }
  function first() { return ids()[0]; }
  return { select, toggle, clear, replace, ids, first, has:id => selected.has(id), sync };
}
/** B"H: Selection is the blue spark around the vessel that says: awake. */
