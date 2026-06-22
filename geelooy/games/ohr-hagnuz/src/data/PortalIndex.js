/**
 * B"H
 * @module PortalIndex
 * Small composer for portal shards.
 */
import { BasePortals } from './PortalIndexBase.js';
import { ExtraPortals } from './PortalIndexExtra.js';
import { MidgamePortals } from './PortalIndexMidgame.js';
import { RambamPortals } from './PortalIndexRambam.js';

const mergePortalShards = (...shards) => {
  const merged = {};
  for (const shard of shards) {
    for (const [mapId, portals] of Object.entries(shard)) {
      merged[mapId] = [...(merged[mapId] || []), ...portals];
    }
  }
  return merged;
};

export const Portals = mergePortalShards(RambamPortals, MidgamePortals, ExtraPortals, BasePortals);
