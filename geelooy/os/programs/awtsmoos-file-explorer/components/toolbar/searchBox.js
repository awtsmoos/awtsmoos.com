// B"H
export function searchBox({ state, controller, onRefresh }) { const input = document.createElement('input'); input.className = 'toolbar-search'; input.type = 'search'; input.placeholder = 'Search'; input.value = state.filter || ''; input.addEventListener('input', async () => { await controller.command.run('filter', { query:input.value }); onRefresh?.(); }); return input; }
/** B"H: incremental search is a real command-backed field. */
