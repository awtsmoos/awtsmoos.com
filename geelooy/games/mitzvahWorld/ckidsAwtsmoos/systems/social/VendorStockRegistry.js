// B"H
/** @file VendorStockRegistry.js @description Solo vendor stock; no auction house needed. */
export const VendorStockRegistry = Object.freeze({ vendor:["healing_herb", "bridge_wood", "spark_fragment", "shechita_knife"], baker:["healing_herb"], scribe:["siddur_page", "traveler_letter"], toolmaker:["bridge_wood", "shechita_knife"] });
export function stockFor(vendorId = "vendor") { return VendorStockRegistry[vendorId] || VendorStockRegistry.vendor; }
export default VendorStockRegistry;
