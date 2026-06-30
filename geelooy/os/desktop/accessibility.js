// B"H
import { openDesktopSearch } from './searchOverlay.js';
import { currentPageLabel } from './pages.js';
import { getDesktopMode } from './modes.js';

/** Accessibility is the architecture refusing to hide its doors. */
export function bindDesktopAccessibility({ os, surface, items, selection }) {
  surface.setAttribute('role', 'application');
  surface.setAttribute('aria-label', `Awtsmoos desktop, ${currentPageLabel()} page, ${getDesktopMode()} layout`);
  surface.addEventListener('keydown', event => {
    const key = event.key.toLowerCase();
    if ((event.ctrlKey || event.metaKey) && key === 'k') { event.preventDefault(); openDesktopSearch({ os, surface, items, selection }); }
    if (!event.ctrlKey && !event.metaKey && event.key === '/') { event.preventDefault(); openDesktopSearch({ os, surface, items, selection }); }
  });
}
