// B"H
/** Chapter 617: Civilization no longer paints a second desktop. */
import { openObjectWindow } from './object-window.js';

export function initCivilizationDesktop({ os } = {}) {
  const desktop = document.getElementById('desktop');
  if (!desktop) return;
  desktop.querySelectorAll('.civ-os-icon').forEach(node => node.remove());
  desktop.dataset.civilizationDesktop = 'single-surface';
  window.AwtsmoosOSObjects = { openObjectWindow: args => openObjectWindow({ os, ...(args || {}) }) };
}

/** B"H: one desktop means one kind of icon; background ghosts are banished. */
