import assert from 'node:assert/strict';
import { buildRoomGraph, validateRoomGraph } from '../ckidsAwtsmoos/Olam/runtime/interiors/RoomGraphRuntime.js';

const rooms = [
  { id: 'entry', exits: ['study'] },
  { id: 'study', exits: ['entry', 'stairs'] },
  { id: 'stairs', exits: ['study', 'upper'] },
  { id: 'upper', exits: ['stairs'] }
];

const graph = buildRoomGraph(rooms);
assert.equal(graph.get('study').has('stairs'), true);
assert.deepEqual(validateRoomGraph(rooms, 'entry'), { ok: true, reachable: ['entry', 'study', 'stairs', 'upper'] });
assert.throws(() => validateRoomGraph([{ id: 'entry', exits: ['missing'] }]), /missing room/);
assert.throws(() => validateRoomGraph([{ id: 'entry', exits: [] }, { id: 'sealed', exits: [] }]), /unreachable/);

console.log('B"H room graph passed');
