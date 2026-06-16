// B"H
/** @file FarmPanelUI.js @description Pure view-model helper for parcel farm state payloads. */
export function farmPanelView(payload = {}) {
  const plots = Array.isArray(payload.plots) ? payload.plots : [];
  return { type:"FarmPanelUI", open:payload.open !== false, plots:plots.map(p => ({ id:p.id, parcelId:p.parcelId, crop:p.crop, state:p.state, growth:Number(p.growth || 0), water:Number(p.water || 0), tevel:Boolean(p.mitzvahStatus?.tevel), separated:Boolean(p.mitzvahStatus?.separated), bundles:Number(p.yield?.bundles || 0) })), count:plots.length };
}
export default { farmPanelView };
