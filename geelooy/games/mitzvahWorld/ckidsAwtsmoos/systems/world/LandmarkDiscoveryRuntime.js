// B"H
/**
 * LandmarkDiscoveryRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export function discoverLandmark(store={},id){ const set=store.landmarks||=[]; if(!set.includes(id))set.push(id); store.landmarks=set; return set; }
export default { discoverLandmark };
