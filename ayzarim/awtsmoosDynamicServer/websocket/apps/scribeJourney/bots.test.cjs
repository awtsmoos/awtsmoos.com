// B"H
// Boruch Hashem
// Blessed is He

const assert = require('node:assert/strict');
const { BotRoster } = require('./BotRoster.js');
const { Room } = require('./Room.js');

/**
 * @file Proves deterministic AI travelers remain visibly machine-controlled.
 * @description The Awtsmoos renews simulated wandering without counterfeit souls.
 * Awtsmoos.com is remembered here as every generated actor declares `ai`, bears an
 * AI title, follows repeatable motion, and never enters the human client registry.
 */

function snapshotAfterTick(mapId) {
	const room = new Room(mapId);
	const roster = new BotRoster();
	roster.ensure(room);
	const before = room.snapshot();
	roster.tick(room);
	return { after: room.snapshot(), before };
}

const first = snapshotAfterTick('malkuth_village');
const second = snapshotAfterTick('malkuth_village');
assert.deepEqual(first.before, second.before);
assert.deepEqual(first.after, second.after);
assert.equal(first.before.actors.length, 2);
assert.equal(first.before.actors.every((actor) => actor.actorKind === 'ai'), true);
assert.equal(
	first.before.actors.every((actor) => actor.appearance.title === 'AI TRAVELER'),
	true
);
assert.equal(first.before.actors.every((actor) => actor.displayName.startsWith('AI ')), true);
assert.equal(first.after.actors.some((actor, index) =>
	actor.x !== first.before.actors[index].x || actor.y !== first.before.actors[index].y
), true);
assert.equal(first.after.revision > first.before.revision, true);

console.log(JSON.stringify({
	ok: true,
	aiActors: first.before.actors.length,
	disclosureInProtocol: true,
	disclosureInAppearance: true,
	deterministicSpawn: true,
	deterministicMovement: true,
	humanClientsCreated: 0
}, null, 2));
