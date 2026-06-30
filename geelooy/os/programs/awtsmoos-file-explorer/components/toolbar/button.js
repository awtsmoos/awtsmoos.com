// B"H
export function toolbarButton(def, run) { const b = document.createElement('button'); b.type = 'button'; b.className = `xp-button toolbar-action ${def.className || ''}`.trim(); b.textContent = def.label; b.title = def.title || def.label; b.dataset.action = def.action; if (def.mode) b.dataset.mode = def.mode; b.addEventListener('click', () => run(def)); return b; }
/** B"H: every button carries a data-action identity. */
