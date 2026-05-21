import assert from 'node:assert/strict';
import { DoorStateMachine } from '../ckidsAwtsmoos/Olam/runtime/doors/DoorStateMachine.js';

const door = new DoorStateMachine('closed');
assert.equal(door.can('open'), true);
assert.deepEqual(door.send('open'), { ok: true, state: 'open', event: 'open' });
assert.deepEqual(door.send('lock'), { ok: false, state: 'open', event: 'lock' });
assert.deepEqual(door.send('close'), { ok: true, state: 'closed', event: 'close' });
assert.equal(door.send('lock').state, 'locked');
assert.equal(door.send('unlock').state, 'closed');
assert.deepEqual(door.snapshot().history, ['closed', 'open', 'closed', 'locked', 'closed']);
assert.throws(() => new DoorStateMachine('fog'), /Invalid door state/);

console.log('B"H door state passed');
