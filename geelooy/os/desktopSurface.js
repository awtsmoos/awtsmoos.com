// B"H
import { desktopIcons, openDesktopIcon } from './desktop/icons.js';
import { loadPositions } from './desktop/storage.js';
import { mergePositions, applyPosition } from './desktop/layout.js';
import { createDesktopSelection } from './desktop/selection.js';
import { bindDesktopDrag } from './desktop/drag.js';
import { bindDesktopContext } from './desktop/contextMenu.js';
import { bindDesktopKeyboard } from './desktop/keyboard.js';
export function renderDesktopSurface(os) {
  const desktop = os.getDesktop?.() || document.getElementById('desktop');
  if (!desktop) return null;
  desktop.querySelector('.awtsmoos-desktop-surface')?.remove();
  const surface = document.createElement('div');
  surface.className = 'awtsmoos-desktop-surface';
  surface.tabIndex = 0;
  const items = desktopIcons(os);
  const positions = mergePositions(items, loadPositions(), desktop);
  const selection = createDesktopSelection(surface);
  items.forEach(item => surface.appendChild(iconNode(os, item, positions[item.id], selection)));
  desktop.appendChild(surface);
  bindDesktopDrag({ surface, positions, selection });
  bindDesktopContext({ os, surface, items, positions, selection });
  bindDesktopKeyboard({ os, surface, items, selection });
  return surface;
}
function iconNode(os, item, point, selection) {
  const button = document.createElement('button');
  button.className = `desktop-icon desktop-icon-${item.kind}`;
  button.dataset.id = item.id; button.dataset.path = item.path || ''; button.dataset.kind = item.kind;
  button.title = item.path ? `${item.title}\n${item.path}` : item.title;
  button.innerHTML = `<span class="desktop-icon-glyph">${item.icon}</span><span class="desktop-icon-label">${escapeHtml(item.title)}</span>`;
  applyPosition(button, point);
  button.addEventListener('click', e => { e.stopPropagation(); (e.ctrlKey || e.metaKey || e.shiftKey) ? selection.toggle(item.id) : selection.select(item.id); });
  button.addEventListener('dblclick', e => { e.stopPropagation(); openDesktopIcon(os, item); });
  button.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); openDesktopIcon(os, item); } });
  return button;
}
function escapeHtml(value) { return String(value || '').replace(/[&<>]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c])); }
/** B"H: desktopSurface orchestrates; every detail lives in a smaller vessel. */
