import assert from 'node:assert/strict';
import { assertSnapshotShape, createWorldSnapshot } from '../ckidsAwtsmoos/Olam/runtime/save/WorldSnapshotRuntime.js';

const snapshot = createWorldSnapshot({
  tick: 7,
  mapId: 'emerald_void_street',
  entities: [{ uu: 'uu_wood' }],
  quests: [{ id: 'gather_emerald_wood', status: 'active' }],
  inventory: [{ item: { id: 'wood' }, amount: 6 }]
});

assert.equal(snapshot.version, 1);
assert.equal(snapshot.savedAtTick, 7);
assert.equal(assertSnapshotShape(snapshot), snapshot);
assert.throws(() => assertSnapshotShape({ version: 2, entities: [], quests: [] }), /Unsupported/);
assert.throws(() => assertSnapshotShape({ version: 1, entities: {}, quests: [] }), /entities must be an array/);

console.log('B"H snapshot passed');
