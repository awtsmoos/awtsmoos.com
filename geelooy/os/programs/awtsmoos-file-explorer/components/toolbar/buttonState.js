// B"H
export function updateButtonState(root, state) { root.querySelectorAll('[data-mode]').forEach(b => b.dataset.active = String(b.dataset.mode === state.viewMode)); root.querySelectorAll('[data-action="paste"]').forEach(b => b.disabled = !state.hasClipboard); root.querySelectorAll('[data-action="back"]').forEach(b => b.disabled = !(state.history?.back?.length)); root.querySelectorAll('[data-action="forward"]').forEach(b => b.disabled = !(state.history?.forward?.length)); }
/** B"H: buttons reveal disabled truth instead of pretending. */
