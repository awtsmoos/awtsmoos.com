// B"H
/**
 * ZoneDiscoveryRuntime
 * The Awtsmoos reveals zones as lived places, not checkboxes. Compatibility
 * exports remain for the worker world import graph.
 */
export function discoverZone(store = {}, zone = 'village') {
  const zones = store.zones || [];
  if (!zones.includes(zone)) zones.push(zone);
  store.zones = zones;
  return zones;
}
export function updateZoneDiscovery(store = {}, zone = 'village', detail = {}) {
  const zones = discoverZone(store, zone);
  const payload = { zone, zones, ...detail, at: Date.now() };
  globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:zone-discovery', { detail: payload }));
  return payload;
}
export function emitZoneDiscovery(zone = 'village', detail = {}) {
  return updateZoneDiscovery({}, zone, detail);
}
export default { discoverZone, updateZoneDiscovery, emitZoneDiscovery };
