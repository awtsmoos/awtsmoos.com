// B"H

/**
 * The rendering facade gathers three small ledgers without returning to the
 * former monolith. Each export preserves the public UI contract.
 */
export { renderGates37 } from './renderers/gates37Renderer.js';
export { renderInventory } from './renderers/inventoryRenderer.js';
export { renderQuestLog } from './renderers/questRenderer.js';
