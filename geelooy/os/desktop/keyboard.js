// B"H
import { openDesktopIcon } from './icons.js';
export function bindDesktopKeyboard({ os, surface, items, selection }) {
  surface.addEventListener('keydown', event => {
    const current = selection.first() || items[0]?.id;
    if (event.key === 'Escape') { selection.clear(); return; }
    if (event.key === 'Enter') { event.preventDefault(); openDesktopIcon(os, items.find(x => x.id === current)); return; }
    const keys = ['ArrowDown','ArrowUp','ArrowRight','ArrowLeft'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const index = Math.max(0, items.findIndex(x => x.id === current));
    const delta = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : event.key === 'ArrowRight' ? 4 : -4;
    const next = items[Math.min(items.length - 1, Math.max(0, index + delta))];
    if (next) { selection.select(next.id); surface.querySelector(`[data-id="${next.id}"]`)?.focus(); }
  });
}
/** B"H: The keyboard walks the desktop like footsteps across a luminous hill. */
