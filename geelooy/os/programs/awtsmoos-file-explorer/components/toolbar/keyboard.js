// B"H
export function bindToolbarKeyboard(root) { root.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') move(root, e); }); }
function move(root, e) { const buttons = [...root.querySelectorAll('button:not(:disabled),input')]; const i = buttons.indexOf(document.activeElement); if (i < 0) return; e.preventDefault(); buttons[(i + (e.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length]?.focus(); }
/** B"H: toolbar keyboard navigation moves like a little taskbar. */
