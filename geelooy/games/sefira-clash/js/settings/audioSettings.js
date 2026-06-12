/**
 * B"H
 * Audio settings vessel.
 *
 * Chapter 32: sound becomes a chosen gate. The Awtsmoos lets the player silence
 * all thunder, keep only combat, keep only arena impacts, or hear the whole
 * palace sing.
 */
const KEY = 'sefiraClashAudioMode';
const DEFAULT_MODE = 'all';

export function readAudioMode() {
  if (typeof localStorage === 'undefined') return DEFAULT_MODE;
  return normalize(localStorage.getItem(KEY) || DEFAULT_MODE);
}

export function writeAudioMode(mode) {
  const value = normalize(mode);
  if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, value);
  return value;
}

export function audioAllowed(category) {
  const mode = readAudioMode();
  if (mode === 'off') return false;
  if (mode === 'all') return true;
  if (mode === 'hits') return category === 'hit' || category === 'charge';
  if (mode === 'world') return category === 'wall' || category === 'fall' || category === 'pickup';
  return true;
}

export function audioModeOptions() {
  return [
    { value: 'all', label: 'All Sound' },
    { value: 'hits', label: 'Hits Only' },
    { value: 'world', label: 'World Only' },
    { value: 'off', label: 'Sound Off' }
  ];
}

function normalize(mode) {
  return ['all', 'hits', 'world', 'off'].includes(mode) ? mode : DEFAULT_MODE;
}
