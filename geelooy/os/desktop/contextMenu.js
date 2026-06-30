// B"H
import { showGenericContextMenu } from '../contextMenuManager.js';
import { autoArrange, applyPosition, snap } from './layout.js';
import { savePositions, clearPositions } from './storage.js';
import { openDesktopIcon } from './icons.js';
import { isMobileDesktop } from './mobile.js';
import { getDesktopMode, modeLabel, setDesktopMode } from './modes.js';
import { nextPage, previousPage, currentPageLabel } from './pages.js';
import { nextWallpaperTheme, currentWallpaperTheme } from './wallpaper.js';
import { toggleDesktopLock, isDesktopLocked } from './lockMode.js';
import { openDesktopSearch } from './searchOverlay.js';
import { installDesktopTemplate } from './templates.js';
import { copyDesktopDiagnostics } from './diagnostics.js';
import { notifyDesktop } from './notifications.js';

export function bindDesktopContext(context) {
  context.surface.addEventListener('contextmenu', event => {
    event.preventDefault();
    const icon = event.target.closest?.('.desktop-icon');
    icon ? iconMenu({ ...context, event, icon }) : desktopMenu({ ...context, event });
  });
}

export function desktopMenu(context) {
  const { os, event, surface, items, allItems, positions, selection, rerender } = context;
  showGenericContextMenu({ event, os, menuItems:new Map([
    [`Page: ${currentPageLabel()}`, () => { nextPage(); rerender?.(); }],
    ['Next desktop page', () => { nextPage(); rerender?.(); }],
    ['Previous desktop page', () => { previousPage(); rerender?.(); }],
    [`Mode: ${modeLabel()}`, () => cycle(rerender)], ['Grid mode', () => choose('grid', rerender)], ['Free mode', () => choose('free', rerender)], ['Office mode', () => choose('office', rerender)],
    [`Wallpaper: ${currentWallpaperTheme().label}`, () => { nextWallpaperTheme(); rerender?.(); }],
    [isDesktopLocked() ? 'Unlock desktop' : 'Lock desktop', () => { toggleDesktopLock(); rerender?.(); }],
    ['Search desktop', () => openDesktopSearch({ os, surface, items:allItems || items, selection })],
    ['Auto arrange', () => arrange(surface, items, positions)], ['Align to grid', () => align(surface, positions)],
    ['Install developer template', () => { installDesktopTemplate('developer', os); rerender?.(); }],
    ['Install explorer template', () => { installDesktopTemplate('explorer', os); rerender?.(); }],
    ['Copy Desktop Diagnostics', () => copyDesktopDiagnostics(context)], ['New desktop shortcut', () => shortcut(os)],
    ['Open Native Tunnel Desktop', () => os.addWindow({ title:'Native Tunnel Desktop', path:'awtsmoos://tunnels/awt-awtsmoos-2113/Desktop', os, programName:'awtsmoosFileExplorer' })],
    ['Open Virtual OS Desktop', () => os.addWindow({ title:'Virtual OS Desktop', path:'awtsmoos://tunnels/awtsmoos-virtual-os/Desktop', os, programName:'awtsmoosFileExplorer' })],
    ['Reset Icon Positions', () => { clearPositions(); rerender?.(); }]
  ]) });
}

function iconMenu({ os, event, icon, items, selection, positions, surface }) {
  const item = items.find(x => x.id === icon.dataset.id);
  if (!item) return notifyDesktop(os, 'Desktop icon no longer exists; refresh the desktop', 'error');
  selection.select(item.id, event.ctrlKey || event.metaKey || event.shiftKey);
  showGenericContextMenu({ event, os, menuItems:new Map([['Open', () => openDesktopIcon(os, item)], ['Copy Path', () => item.path && navigator.clipboard?.writeText(item.path)], ['Align to grid', () => alignOne(item, icon, positions, surface)]]) });
}
function cycle(r) { const modes = ['grid','free','office']; choose(modes[(modes.indexOf(getDesktopMode()) + 1) % modes.length], r); }
function choose(mode, r) { setDesktopMode(mode); r?.(); }
function shortcut(os) { const path = prompt('Shortcut path or URL', '/'); const title = prompt('Shortcut title', path?.split('/').pop() || 'Shortcut'); if (path && title) os?.addDesktopShortcut?.({ title, path }); }
function arrange(surface, items, positions) { Object.assign(positions, autoArrange(items, surface)); place(surface, positions); savePositions(positions, isMobileDesktop(surface)); }
function align(surface, positions) { Object.keys(positions).forEach(id => positions[id] = snap(positions[id], surface)); place(surface, positions); savePositions(positions, isMobileDesktop(surface)); }
function alignOne(item, icon, positions, surface) { positions[item.id] = snap(positions[item.id], surface); applyPosition(icon, positions[item.id]); savePositions(positions, isMobileDesktop(surface)); }
function place(surface, positions) { surface.querySelectorAll('.desktop-icon').forEach(node => applyPosition(node, positions[node.dataset.id])); }
/** B"H: desktop menu commands pages, wallpaper, lock, search, templates, diagnostics, and guards stale icons. */
