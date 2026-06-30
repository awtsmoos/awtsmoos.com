// B"H
import { desktopIcons, openDesktopIcon } from './desktop/icons.js';
import { loadPositions } from './desktop/storage.js';
import { mergePositions, applyPosition } from './desktop/layout.js';
import { createDesktopSelection } from './desktop/selection.js';
import { bindDesktopDrag } from './desktop/drag.js';
import { bindDesktopContext, desktopMenu } from './desktop/contextMenu.js';
import { bindDesktopKeyboard } from './desktop/keyboard.js';
import { mobileClass, isMobileDesktop } from './desktop/mobile.js';
import { applySafeArea } from './desktop/safeArea.js';
import { bindLongPress, isTap } from './desktop/mobileGestures.js';
import { bindRelayout } from './desktop/relayout.js';
export function renderDesktopSurface(os) {
  const desktop = os.getDesktop?.() || document.getElementById('desktop'); if (!desktop) return null;
  desktop.querySelector('.awtsmoos-desktop-surface')?.remove(); const surface = document.createElement('div'); surface.className = 'awtsmoos-desktop-surface'; surface.tabIndex = 0;
  applySafeArea(surface, desktop); const mobile = mobileClass(surface); const items = desktopIcons(os); const positions = mergePositions(items, loadPositions(mobile), surface); const selection = createDesktopSelection(surface);
  items.forEach(item => surface.appendChild(iconNode(os, item, positions[item.id], selection, surface))); desktop.appendChild(surface);
  bindDesktopDrag({ surface, positions, selection }); bindDesktopContext({ os, surface, items, positions, selection }); bindDesktopKeyboard({ os, surface, items, selection }); bindRelayout({ desktop, surface, items, positions }); bindSurfaceTouchMenu({ os, surface, items, positions }); return surface;
}
function iconNode(os, item, point, selection, surface) {
  const button = document.createElement('button'); button.className = `desktop-icon desktop-icon-${item.kind}`; button.dataset.id = item.id; button.dataset.path = item.path || ''; button.dataset.kind = item.kind; button.type = 'button'; button.title = item.path ? `${item.title}\n${item.path}` : item.title;
  button.innerHTML = `<span class="desktop-icon-glyph">${item.icon}</span><span class="desktop-icon-label">${escapeHtml(item.title)}</span>`; applyPosition(button, point); let down = null;
  button.addEventListener('pointerdown', e => down = { x:e.clientX, y:e.clientY, time:Date.now() });
  button.addEventListener('click', e => { e.stopPropagation(); if (down && !isTap(down, e)) return; (e.ctrlKey || e.metaKey || e.shiftKey) ? selection.toggle(item.id) : selection.select(item.id); if (isMobileDesktop(surface)) openDesktopIcon(os, item); });
  button.addEventListener('dblclick', e => { e.stopPropagation(); openDesktopIcon(os, item); });
  button.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); openDesktopIcon(os, item); } });
  bindLongPress(button, e => { e.preventDefault(); button.dispatchEvent(new MouseEvent('contextmenu', { bubbles:true, cancelable:true, clientX:e.clientX, clientY:e.clientY })); }); return button;
}
function bindSurfaceTouchMenu({ os, surface, items, positions }) { bindLongPress(surface, e => { if (e.target.closest?.('.desktop-icon')) return; desktopMenu({ os, event:e, surface, items, positions }); }); }
function escapeHtml(value) { return String(value || '').replace(/[&<>]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c])); }
/** B"H: Desktop surface now measures safe areas, snaps phone grids, and opens by tap. */
