// B"H
/** Chapter 311: Heichel visual diagnostics. */
import { reportModalHealth } from './modalHealth.js';
import { reportHeichelScrollHealth } from './scrollHealth.js';

export function runHeichelVisualDiagnostics() {
  return { modal: reportModalHealth(), scroll: reportHeichelScrollHealth() };
}
