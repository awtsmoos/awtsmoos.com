// B"H
const KEY = 'awtsmoos:desktop:page:v1';
export const DESKTOP_PAGES = ['Home', 'Tunnels', 'Creation', 'Diagnostics'];

/** The desktop is not one flat meadow; it is a set of worlds. */
export function getCurrentPage() {
  try { return clamp(Number(localStorage.getItem(KEY) || 0)); } catch { return 0; }
}

/** @param {number} page */
export function setCurrentPage(page) {
  const next = clamp(page);
  try { localStorage.setItem(KEY, String(next)); } catch {}
  return next;
}

export function nextPage() { return setCurrentPage(getCurrentPage() + 1); }
export function previousPage() { return setCurrentPage(getCurrentPage() - 1); }
export function currentPageLabel(page = getCurrentPage()) { return DESKTOP_PAGES[clamp(page)]; }

/** @param {Array<object>} items */
export function filterDesktopItems(items, page = getCurrentPage()) {
  return (items || []).filter(item => item.pinAllPages || (item.pages || [item.page ?? 0]).includes(page));
}

function clamp(page) {
  const count = DESKTOP_PAGES.length;
  return ((Number.isFinite(page) ? page : 0) % count + count) % count;
}
