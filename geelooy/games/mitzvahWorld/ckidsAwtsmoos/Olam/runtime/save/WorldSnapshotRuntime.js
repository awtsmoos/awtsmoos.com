/**
 * B"H
 * @file WorldSnapshotRuntime.js
 *
 * Chapter 35: The Moment Entered A Crystal Vessel.
 *
 * The Awtsmoos renews all existence every instant; a save snapshot is a humble
 * echo of that renewal. It gathers only data-safe state, never meshes, never
 * functions, so the world may wake again without false memory.
 */

export function createWorldSnapshot(parts = {}) {
  return JSON.parse(JSON.stringify({
    version: 1,
    savedAtTick: parts.tick ?? 0,
    mapId: parts.mapId ?? null,
    player: parts.player ?? {},
    entities: parts.entities ?? [],
    quests: parts.quests ?? [],
    inventory: parts.inventory ?? [],
    passages: parts.passages ?? [],
    cityState: parts.cityState ?? {}
  }));
}

export function assertSnapshotShape(snapshot) {
  if (snapshot.version !== 1) throw new Error('Unsupported snapshot version.');
  if (!Array.isArray(snapshot.entities)) throw new Error('Snapshot entities must be an array.');
  if (!Array.isArray(snapshot.quests)) throw new Error('Snapshot quests must be an array.');
  return snapshot;
}
