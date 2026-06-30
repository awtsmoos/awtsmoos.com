// B"H
const KEY = 'awtsmoos:desktop:wallpaper-theme:v1';
export const WALLPAPERS = [
  { id:'awtsmoos-blue', label:'Awtsmoos Blue', bg:'radial-gradient(circle at 20% 15%,rgba(92,246,255,.28),transparent 20%),linear-gradient(155deg,#0b2a66 0%,#1169d7 45%,#1f9f6a 100%)', dim:'.08', blur:'0px' },
  { id:'neon-merkava', label:'Neon Merkava', bg:'radial-gradient(circle at 70% 20%,rgba(82,255,184,.30),transparent 24%),linear-gradient(145deg,#040b1f,#142e77 52%,#5a1fa8)', dim:'.16', blur:'0px' },
  { id:'deep-vessel', label:'Deep Vessel', bg:'radial-gradient(circle at 25% 30%,rgba(58,167,255,.22),transparent 26%),linear-gradient(160deg,#030814,#071729 48%,#102f47)', dim:'.28', blur:'1px' }
];

/** The wallpaper is a sky with memory, not a static paint bucket. */
export function currentWallpaperTheme() {
  const id = readThemeId();
  return WALLPAPERS.find(theme => theme.id === id) || WALLPAPERS[0];
}

export function nextWallpaperTheme() {
  const now = currentWallpaperTheme();
  const index = WALLPAPERS.findIndex(theme => theme.id === now.id);
  return setWallpaperTheme(WALLPAPERS[(index + 1) % WALLPAPERS.length].id);
}

/** @param {string} id */
export function setWallpaperTheme(id) {
  const theme = WALLPAPERS.find(item => item.id === id) || WALLPAPERS[0];
  try { localStorage.setItem(KEY, theme.id); } catch {}
  return theme;
}

/** @param {HTMLElement} surface @param {HTMLElement=} desktop */
export function applyWallpaper(surface, desktop = surface?.parentElement) {
  const theme = currentWallpaperTheme();
  if (desktop) {
    desktop.dataset.wallpaper = theme.id;
    desktop.style.setProperty('--desktop-wallpaper', theme.bg);
    desktop.style.setProperty('--desktop-wallpaper-dim', theme.dim);
    desktop.style.setProperty('--desktop-wallpaper-blur', theme.blur);
  }
  if (surface) surface.dataset.wallpaper = theme.id;
  return theme;
}

function readThemeId() { try { return localStorage.getItem(KEY); } catch { return null; } }
/** B"H: wallpaper now reaches the desktop vessel even before attachment. */
