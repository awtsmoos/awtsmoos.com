// B"H
/** @file VendorStockRegistry.js @description Solo vendor stock, including simple drink goods already priced by the economy. */
export const VendorStockRegistry = Object.freeze({ vendor:['healing_herb','bridge_wood','spark_fragment','shechita_knife','water_cup','tea'], baker:['healing_herb','warm_bread','tea','milk'], scribe:['siddur_page','traveler_letter'], toolmaker:['bridge_wood','shechita_knife'] });
export function stockFor(vendorId = 'vendor') { return VendorStockRegistry[vendorId] || VendorStockRegistry.vendor; }
export default VendorStockRegistry;
