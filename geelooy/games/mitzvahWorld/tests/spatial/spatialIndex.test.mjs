// B"H
import assert from 'node:assert/strict';
import { LocalizedSpatialHash, NearbySpatialIndex } from '../../systems/spatial/index.js';

const world = { minX: -512, minY: -64, minZ: -512, maxX: 512, maxY: 128, maxZ: 512 };
const box = (id, x, z, size = 1) => ({ id, minX: x, minY: 0, minZ: z, maxX: x + size, maxY: 2, maxZ: z + size });

const index = new NearbySpatialIndex(world, { cellSize: 8, maxDepth: 7, maxItems: 8 });
for (let i = 0; i < 1500; i += 1) index.addStatic(box(`solid_${i}`, (i % 75) * 4 - 150, Math.floor(i / 75) * 4 - 120, 2));
index.addStatic(box('near_solid', 1, 1, 2));
for (let i = 0; i < 600; i += 1) index.upsertMoving(`mob_${i}`, box(`mob_${i}`, 300 + i, 300, 1));
index.upsertMoving('near_mob', box('near_mob', 2, 2, 1));

const out = index.query({ x: 0, y: 0, z: 0 }, 10);
assert(out.static.some(item => item.id === 'near_solid'), 'nearby static solid should be found');
assert(out.moving.some(item => item.id === 'near_mob'), 'near moving entity should be found');
assert(!out.moving.some(item => item.id === 'mob_10'), 'far moving entity should stay out');

index.upsertMoving('mob_10', box('mob_10', 3, 3, 1));
assert(index.query({ x: 0, y: 0, z: 0 }, 10).moving.some(item => item.id === 'mob_10'));
index.removeMoving('mob_10');
assert(!index.query({ x: 0, y: 0, z: 0 }, 10).moving.some(item => item.id === 'mob_10'));

const hash = new LocalizedSpatialHash(4);
hash.insert('a', box('a', 1, 1, 1));
assert.equal(hash.queryNear({ x: 0, y: 0, z: 0 }, 3, id => box(id, 1, 1, 1)).length, 1);

console.log(JSON.stringify({ ok: true, stats: index.stats(), nearStatic: out.static.length, nearMoving: out.moving.length }, null, 2));
