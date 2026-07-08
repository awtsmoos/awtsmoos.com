// B"H
/** @file inventoryFallback.js @description Inventory data refreshes without forcing the wardrobe open. */
import { closePanels } from './domKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function dispatchInventory(ob = {}) {
  if (ob?.open === true || ob?.forceOpen === true) closePanels();
  window.dispatchEvent(new CustomEvent('awtsInventoryUpdate', { detail: ob }));
  if (ob?.open === true || ob?.forceOpen === true) {
    document.getElementById('inventoryScreen')?.dispatchEvent(new CustomEvent('awtsInventoryOpen', { bubbles: true }));
  }
}
