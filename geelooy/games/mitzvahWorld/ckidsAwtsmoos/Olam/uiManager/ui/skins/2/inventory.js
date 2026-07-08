
/**
 * B"H
 * @module InventoryAggregator
 * @description
 * THE UNIFICATION OF THE TREASURY
 * 
 * This module aggregates the layout, slots, and context menu skins 
 * into a single unified aesthetic decree.
 */
import layout from "./inventory/layout.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import slots from "./inventory/slots.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import contextMenu from "./inventory/contextMenu.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import tooltips from "./inventory/tooltips.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default /*css*/`
    ${layout}
    ${slots}
    ${contextMenu}
    ${tooltips}
`;
