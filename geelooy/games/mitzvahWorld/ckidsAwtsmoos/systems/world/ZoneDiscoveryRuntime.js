// B"H
/**
 * ZoneDiscoveryRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export function discoverZone(store={},zone){ const zones=store.zones||=[]; if(!zones.includes(zone))zones.push(zone); store.zones=zones; return zones; }
export default { discoverZone };
