// B"H
export function zoneManifest(zone = {}) { return { id:zone.id || "starting_zone", title:zone.title || "Starting Zone", biome:zone.biome || "forest_valley", createdAt:new Date().toISOString() }; }
