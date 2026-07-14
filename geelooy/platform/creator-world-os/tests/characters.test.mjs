// B"H
// Boruch Hashem
// Blessed is He
/** @module CharactersTrainTest @description Verifies chapters thirty-six through forty. */
import assert from 'node:assert/strict';
import {
	acceptLeaseTransfer,
	assertProjectionIsolation,
	characterLeaseActive,
	createCharacterLease,
	createCharacterPassport,
	createGameProjection,
	createLeaseTransfer,
	recoverCharacterLease
} from '../characters/index.mjs';

const passport = createCharacterPassport({ accountId: 'account', aliasId: 'alias', name: 'Or' });
assert.equal(passport.aliasId, 'alias');
const now = Date.parse('2026-01-01T00:00:00Z');
const lease = createCharacterLease({ characterId: passport.id, sessionId: 's1', leaseMs: 1000 }, now);
assert.equal(characterLeaseActive(lease, now + 1), true);
const projection = createGameProjection({ characterId: passport.id, gameId: 'city', progression: { chapter: 2 } });
assert.equal(assertProjectionIsolation(projection), true);
assert.throws(() => assertProjectionIsolation({ progression: { aliasId: 'bad' } }));
const transfer = createLeaseTransfer({ characterId: passport.id, fromSessionId: 's1', toSessionId: 's2' });
assert.equal(acceptLeaseTransfer(transfer, 'owner').state, 'accepted');
assert.throws(() => recoverCharacterLease(lease, { sessionId: 's2', leaseMs: 1000 }, now));
const recovered = recoverCharacterLease(lease, { sessionId: 's2', leaseMs: 1000 }, now + 2000);
assert.equal(recovered.lease.generation, 2);
console.log('B"H characters train passed.');
