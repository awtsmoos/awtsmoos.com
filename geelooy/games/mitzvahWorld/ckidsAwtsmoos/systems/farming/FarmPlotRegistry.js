// B"H
/** @file FarmPlotRegistry.js @description Converts parcel gardens into live farm plots. */
export function plotFromGarden(garden) {
  return { id: garden.id, parcelId: garden.parcelId, crop: garden.crop, state: "tilled", growth: 0, water: 0, beds: garden.beds || [], mitzvahStatus: { tevel: false, separated: false }, yield: { bundles: 0 } };
}
export function ensureFarmState(olam) { olam.__farmState ||= { plots: {} }; return olam.__farmState; }
export function registerFarmPlots(olam, gardens = []) { const state = ensureFarmState(olam); for (const g of gardens) state.plots[g.id] ||= plotFromGarden(g); emitFarm(olam); return state; }
export function farmPlots(olam) { return Object.values(ensureFarmState(olam).plots); }
export function emitFarm(olam) { const payload = { plots: farmPlots(olam) }; olam?.ayshPeula?.("ui event", "farmPanel", payload); return payload; }
export default { plotFromGarden, ensureFarmState, registerFarmPlots, farmPlots, emitFarm };
