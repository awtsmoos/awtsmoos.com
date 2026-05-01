
/**
 * B"H
 * @module InventoryAggregator
 * @description
 * THE UNIFICATION OF THE TREASURY
 * 
 * This module aggregates the layout, slots, and context menu skins 
 * into a single unified aesthetic decree.
 */
import layout from "./inventory/layout.js";
import slots from "./inventory/slots.js";
import contextMenu from "./inventory/contextMenu.js";
import tooltips from "./inventory/tooltips.js";

export default /*css*/`
    ${layout}
    ${slots}
    ${contextMenu}
    ${tooltips}
`;
