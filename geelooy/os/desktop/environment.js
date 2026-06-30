// B"H
import { getDesktopMode } from './modes.js';
import { getCurrentPage, currentPageLabel } from './pages.js';
import { applyWallpaper, currentWallpaperTheme } from './wallpaper.js';
import { isDesktopLocked } from './lockMode.js';

/** The surface is prepared like a vessel: named, emptied, themed, and ready. */
export function prepareDesktopSurface(os) {
  const desktop = os.getDesktop?.() || document.getElementById('desktop');
  if (!desktop) return null;
  desktop.querySelector('.awtsmoos-desktop-surface')?.remove();
  const surface = document.createElement('div');
  surface.className = 'awtsmoos-desktop-surface';
  surface.tabIndex = 0;
  surface.dataset.layoutMode = getDesktopMode();
  surface.dataset.page = String(getCurrentPage());
  surface.dataset.pageLabel = currentPageLabel();
  surface.dataset.locked = isDesktopLocked() ? 'true' : 'false';
  surface.classList.toggle('desktop-locked', isDesktopLocked());
  const theme = applyWallpaper(surface, desktop);
  surface.dataset.wallpaperLabel = theme.label;
  return { desktop, surface, mode:getDesktopMode(), page:getCurrentPage(), wallpaper:currentWallpaperTheme(), locked:isDesktopLocked() };
}

/** @param {HTMLElement} desktop @param {HTMLElement} surface @param {object} positions */
export function attachDesktopSurface(desktop, surface, positions) {
  desktop.appendChild(surface);
  const maxY = Math.max(0, ...Object.values(positions || {}).map(point => point.y || 0));
  surface.style.minHeight = `${maxY + 190}px`;
}
/** B"H: the environment applies sky-memory before the city is attached. */
