// B"H
import { Ray } from '../math/Ray.js';
import { normalize, v } from '../math/Geometry3D.js';

/**
 * The earth is not a number whispered from memory. It is measured anew at
 * every coordinate, as creation is renewed every instant. This sampler keeps
 * placement honest: collision truth first, terrain truth as the explicit
 * phase-one fallback, and evidence returned with every answer.
 */
export function createGroundSampler({ terrainHeightAt, octree = null, top = 96 } = {}) {
  if (typeof terrainHeightAt !== 'function') throw new TypeError('terrainHeightAt must be a function');
  const api = {
    terrainHeightAt,
    octree,
    top,
    heightAt(x, z, options = {}) {
      const terrainY = terrainHeightAt(x, z);
      const rayTop = options.top ?? top;
      const hit = octree?.raycast(
        new Ray({ x, y: rayTop, z }, { x: 0, y: -1, z: 0 }),
        options.maxDistance ?? rayTop + 128,
        options.predicate || groundPredicate
      );
      if (hit && Number.isFinite(hit.point?.y) && hit.point.y >= terrainY - .001) {
        return { y: hit.point.y, normal: hit.item.normal, kind: hit.item.kind, source: 'octree-raycast', hit };
      }
      return { y: terrainY, normal: terrainNormal(terrainHeightAt, x, z), kind: 'terrain', source: 'terrain-height', hit: null };
    },
    placeOnGround(localToWorld, lx, lz, options = {}) {
      const p = localToWorld(lx, lz);
      const sample = api.heightAt(p.x, p.z, options);
      return { x: p.x, y: sample.y, z: p.z, sample };
    },
    samplePath(points, options = {}) {
      return points.map(point => ({ ...point, sample: api.heightAt(point.x, point.z, options), y: api.heightAt(point.x, point.z, options).y }));
    },
    withOctree(nextOctree) { return createGroundSampler({ terrainHeightAt, octree: nextOctree, top }); },
    stats() { return { mode: octree ? 'terrain-height/raycast' : 'terrain-height-phase-one', hasOctree: !!octree, top }; }
  };
  return api;
}

function groundPredicate(item) {
  return !!item?.solid && (!!item.floor || item.normal?.y > .24);
}

function terrainNormal(heightAt, x, z) {
  const e = .08;
  return normalize(v(heightAt(x - e, z) - heightAt(x + e, z), 2 * e, heightAt(x, z - e) - heightAt(x, z + e)));
}
