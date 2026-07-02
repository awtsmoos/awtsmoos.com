// B"H
import { desktopIcons } from './desktop/icons.js';
import { addShortcut } from './desktop/shortcuts.js';
import { loadPositions } from './desktop/storage.js';
import { mergePositions } from './desktop/layout.js';
import { createDesktopSelection } from './desktop/selection.js';
import { bindDesktopDrag } from './desktop/drag.js';
import { bindDesktopContext, desktopMenu } from './desktop/contextMenu.js';
import { bindDesktopKeyboard } from './desktop/keyboard.js';
import { mobileClass, isMobileDesktop } from './desktop/mobile.js';
import { applySafeArea } from './desktop/safeArea.js';
import { bindLongPress, isTap } from './desktop/mobileGestures.js';
import { bindRelayout } from './desktop/relayout.js';
import { filterDesktopItems } from './desktop/pages.js';
import { prepareDesktopSurface, attachDesktopSurface } from './desktop/environment.js';
import { createDesktopIconNode } from './desktop/iconNode.js';
import { bindDesktopAccessibility } from './desktop/accessibility.js';
import { desktopDiagnostics } from './desktop/diagnostics.js';

export function renderDesktopSurface(os) {
  void isTap; void isMobileDesktop;
  const env = prepareDesktopSurface(os); if (!env) return null;
  const { desktop, surface } = env; os.addDesktopShortcut = shortcut => { addShortcut(shortcut); os.renderDesktop?.(); };
  applySafeArea(surface, desktop); const mobile = mobileClass(surface); const allItems = desktopIcons(os); const items = filterDesktopItems(allItems);
  const positions = mergePositions(items, loadPositions(mobile), surface); const selection = createDesktopSelection(surface);
  items.forEach(item => surface.appendChild(createDesktopIconNode({ os, item, point:positions[item.id], selection, surface })));
  sizeSurfaceForIcons(surface, positions);
  attachDesktopSurface(desktop, surface, positions); const rerender = () => renderDesktopSurface(os);
  const context = { os, surface, items, allItems, positions, selection, rerender };
  bindDesktopDrag(context); bindDesktopContext(context); bindDesktopKeyboard({ os, surface, items, selection }); bindRelayout({ desktop, surface, items, positions }); bindSurfaceTouchMenu(context); bindDesktopAccessibility({ os, surface, items:allItems, selection });
  surface.awtsmoosDesktopDiagnostics = () => desktopDiagnostics(context); return surface;
}
function sizeSurfaceForIcons(surface, positions) { const bottom = Math.max(0, ...Object.values(positions).map(p => (p?.y || 0) + 156)); surface.style.minHeight = `${Math.max(surface.clientHeight || 0, bottom)}px`; }
function bindSurfaceTouchMenu(context) { bindLongPress(context.surface, e => { if (e.target.closest?.('.desktop-icon')) return; desktopMenu({ ...context, event:e }); }); }
/** B"H: when icons overflow, the desktop grows and scrolls instead of crushing. */
