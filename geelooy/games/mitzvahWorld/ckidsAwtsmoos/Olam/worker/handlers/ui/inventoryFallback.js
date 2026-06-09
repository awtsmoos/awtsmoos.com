// B"H
/** @file inventoryFallback.js @description Chapter 397: Inventory opens through one event vessel. */
import { closePanels } from './domKit.js';
export function dispatchInventory(ob = {}) {
  closePanels();
  window.dispatchEvent(new CustomEvent('awtsInventoryUpdate', { detail: ob }));
  document.getElementById('inventoryScreen')?.dispatchEvent(new CustomEvent('awtsInventoryOpen', { bubbles: true }));
}
