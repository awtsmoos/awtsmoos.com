// B"H
/** @file inventoryFallback.js @description Inventory data refreshes without forcing the wardrobe open. */
import { closePanels } from './domKit.js';
export function dispatchInventory(ob = {}) {
  if (ob?.open === true || ob?.forceOpen === true) closePanels();
  window.dispatchEvent(new CustomEvent('awtsInventoryUpdate', { detail: ob }));
  if (ob?.open === true || ob?.forceOpen === true) {
    document.getElementById('inventoryScreen')?.dispatchEvent(new CustomEvent('awtsInventoryOpen', { bubbles: true }));
  }
}
