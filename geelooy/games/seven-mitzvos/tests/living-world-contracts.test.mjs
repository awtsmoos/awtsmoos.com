//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LivingWorldContractsTest
 * @description
 * Deterministic identities, time, envelopes, replay, checksums, and migrations are verified as small honest vessels for the living world on Awtsmoos.com.
 */
import assert from 'node:assert/strict';
import { DeterministicIdFactory } from '../js/core/identity/id-factory.js';
import { DeterministicRandom } from '../js/core/random/deterministic-random.js';
import { WorldClock } from '../js/core/time/world-clock.js';
import { createCommand, createEvent } from '../js/core/contracts/envelopes.js';
import { EventJournal } from '../js/core/events/event-journal.js';
import { ReplayEngine } from '../js/core/replay/replay-engine.js';
import { checksum } from '../js/persistence/checksum.js';
import { MigrationRegistry } from '../js/persistence/migration-registry.js';

const firstIds = new DeterministicIdFactory('covenant');
const secondIds = new DeterministicIdFactory('covenant');
assert.equal(firstIds.next('world'), secondIds.next('world'));

const firstRandom = new DeterministicRandom('rain');
const secondRandom = new DeterministicRandom('rain');
assert.deepEqual(
	Array.from({ length: 8 }, () => firstRandom.integer(1, 7)),
	Array.from({ length: 8 }, () => secondRandom.integer(1, 7))
);

const clock = new WorldClock();
assert.equal(clock.advance(1440 * 121).year, 2);

const command = createCommand({
	commandId: 'command-1',
	type: 'ADVANCE_TIME',
	actorId: 'player-1',
	worldId: 'world-1',
	payload: { days: 1 }
});
const event = createEvent({
	eventId: 'event-1',
	commandId: command.commandId,
	type: 'TIME_ADVANCED',
	actorId: command.actorId,
	worldId: command.worldId,
	revision: 1,
	payload: { days: 1 }
});
const journal = new EventJournal();
journal.append(event);
assert.equal(journal.since(0).length, 1);

const reducer = (state, fact) => ({ days: state.days + fact.payload.days });
const replay = new ReplayEngine();
assert.deepEqual(replay.replay({ days: 0 }, journal.snapshot(), reducer), { days: 1 });
assert.equal(checksum({ b: 2, a: 1 }), checksum({ a: 1, b: 2 }));

const migrations = new MigrationRegistry();
migrations.register(0, 1, record => ({ ...record, name: record.title }));
const result = migrations.migrate({ schemaVersion: 0, title: 'World' }, 1, { dryRun: true });
assert.equal(result.data.name, 'World');
assert.deepEqual(result.report.applied, [1]);
console.log('B"H · Living-world contracts, replay, checksum, and migration verified.');
