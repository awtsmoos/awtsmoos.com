// B"H
import { getDesktopMode } from './modes.js';
import { getCurrentPage, currentPageLabel } from './pages.js';
import { currentWallpaperTheme } from './wallpaper.js';
import { isDesktopLocked } from './lockMode.js';
import { notifyDesktop, explainFailure } from './notifications.js';

/** The desktop reveals its pulse before the inspector asks twice. */
export function desktopDiagnostics({ surface, items = [], positions = {}, selection } = {}) {
  return {
    mode:getDesktopMode(), page:getCurrentPage(), pageLabel:currentPageLabel(),
    wallpaper:currentWallpaperTheme().id, locked:isDesktopLocked(), iconCount:items.length,
    selectedCount:selection?.ids?.().length || 0, positionedCount:Object.keys(positions).length,
    viewport:{ width:innerWidth, height:innerHeight }, surface:{ width:surface?.clientWidth || 0, height:surface?.clientHeight || 0 }
  };
}

/** @param {object} context */
export async function copyDesktopDiagnostics(context) {
  const report = desktopDiagnostics(context);
  try {
    await navigator.clipboard?.writeText(JSON.stringify(report, null, 2));
    notifyDesktop(context.os, 'Desktop diagnostics copied', 'success');
  } catch (error) { explainFailure(context.os, 'Copy desktop diagnostics', error); }
  return report;
}
