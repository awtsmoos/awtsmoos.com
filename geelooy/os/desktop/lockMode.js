// B"H
const KEY = 'awtsmoos:desktop:lock-mode:v1';

/** The lock is not a prison; it is a covenant against accidental dragging. */
export function isDesktopLocked() {
  try { return localStorage.getItem(KEY) === 'locked'; } catch { return false; }
}

/** @param {boolean} locked */
export function setDesktopLocked(locked) {
  try { localStorage.setItem(KEY, locked ? 'locked' : 'unlocked'); } catch {}
  return locked;
}

export function toggleDesktopLock() { return setDesktopLocked(!isDesktopLocked()); }
