// B"H
export function createExplorerSelection({ emit = () => {} } = {}) {
  const selected = new Set();
  const publish = () => emit('explorer.selection.change', snapshot());
  function select(path) { if (path) selected.add(path); publish(); }
  function unselect(path) { selected.delete(path); publish(); }
  function toggle(path) { selected.has(path) ? selected.delete(path) : selected.add(path); publish(); }
  function clear() { selected.clear(); publish(); }
  function selectAll(paths = []) { selected.clear(); paths.filter(Boolean).forEach(path => selected.add(path)); publish(); }
  function has(path) { return selected.has(path); }
  function snapshot() { return { paths:[...selected], count:selected.size }; }
  return { select, unselect, toggle, clear, selectAll, has, snapshot };
}

/** B"H: selection is a quiet covenant in memory before it becomes green light. */
