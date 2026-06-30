// B"H
import { showGenericContextMenu } from '../contextMenuManager.js';
import { autoArrange, applyPosition, snap } from './layout.js';
import { savePositions, clearPositions } from './storage.js';
import { openDesktopIcon } from './icons.js';
export function bindDesktopContext({ os, surface, items, positions, selection }) {
  surface.addEventListener('contextmenu', event => {
    const icon = event.target.closest?.('.desktop-icon');
    if (icon) return iconMenu({ os, event, icon, items, selection, positions });
    showGenericContextMenu({ event, os, menuItems:new Map([
      ['Auto arrange', () => arrange(surface, items, positions)],
      ['Align to grid', () => align(surface, positions)],
      ['Open Connected Tunnels', () => os.addWindow({ title:'Connected Tunnels', path:'awtsmoos://tunnels', os, programName:'awtsmoosFileExplorer' })],
      ['Refresh Remote Drives', () => os.refreshRemoteDrives?.().then(() => os.renderDesktop?.())],
      ['Reset Icon Positions', () => { clearPositions(); os.renderDesktop?.(); }]
    ]) });
  });
}
function iconMenu({ os, event, icon, items, selection, positions }) {
  const item = items.find(x => x.id === icon.dataset.id);
  selection.select(item.id, event.ctrlKey || event.metaKey || event.shiftKey);
  showGenericContextMenu({ event, os, menuItems:new Map([
    ['Open', () => openDesktopIcon(os, item)],
    ['Copy Path', () => item.path && navigator.clipboard?.writeText(item.path)],
    ['Align to grid', () => { positions[item.id] = snap(positions[item.id], icon.parentElement); applyPosition(icon, positions[item.id]); savePositions(positions); }]
  ]) });
}
function arrange(surface, items, positions) { Object.assign(positions, autoArrange(items, surface)); place(surface, positions); savePositions(positions); }
function align(surface, positions) { Object.keys(positions).forEach(id => positions[id] = snap(positions[id], surface)); place(surface, positions); savePositions(positions); }
function place(surface, positions) { surface.querySelectorAll('.desktop-icon').forEach(node => applyPosition(node, positions[node.dataset.id])); }
/** B"H: A right click opens an XP court where every menu item has work. */
