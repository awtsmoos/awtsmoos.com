// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module IsraelMode
 * @description
 * Israel vs Diaspora reading schedule. Auto-detects from the device timezone
 * (Asia/Jerusalem), with a manual override toggle persisted in localStorage.
 * URL param chitasIsrael=1/0 takes precedence for shareable links.
 */

const STORAGE_KEY = 'awtsmoos-chitas-israel';
const JERUSALEM_TZ = 'Asia/Jerusalem';

export function detectIsraelByTimezone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz === JERUSALEM_TZ;
  } catch {
    return false;
  }
}

export function getStoredIsraelMode() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === '1') return true;
    if (v === '0') return false;
  } catch { /* ignore */ }
  return null;
}

export function setStoredIsraelMode(israel) {
  try {
    localStorage.setItem(STORAGE_KEY, israel ? '1' : '0');
  } catch { /* ignore */ }
}

/**
 * Resolves Israel mode: URL param > stored preference > timezone auto-detect.
 */
export function resolveIsraelMode(search = globalThis.location?.search || '') {
  const param = new URLSearchParams(search).get('chitasIsrael');
  if (param === '1') return true;
  if (param === '0') return false;
  const stored = getStoredIsraelMode();
  if (stored !== null) return stored;
  return detectIsraelByTimezone();
}
