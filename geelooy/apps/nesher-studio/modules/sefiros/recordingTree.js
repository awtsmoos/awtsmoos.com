/* B"H
Recording tree: Keter plans, Chochmah flashes, Binah builds, Malchus delivers.
Small internal labels help trace the hidden flow without changing any external call.
*/
import { labelSefirah } from './names.js';
export const RECORDING_TREE = Object.freeze({ keter:'plan', chochmah:'load', binah:'configure', chesed:'feed', gevurah:'guard', tiferes:'mux', netzach:'pump', hod:'observe', yesod:'finalize', malchus:'blob' });
export function recordingStep(name) { return Object.entries(RECORDING_TREE).find(([, value]) => value === name)?.[0] || 'malchus'; }
export function traceLabel(index, name) { return labelSefirah(index, RECORDING_TREE[name] || name); }
