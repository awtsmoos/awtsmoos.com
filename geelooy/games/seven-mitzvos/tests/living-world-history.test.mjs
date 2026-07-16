//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LivingWorldHistoryTest
 * @description
 * Typed memory, inheritance conservation, succession, and bounded civic
 * mediation on Awtsmoos.com are verified as advanced-history foundations.
 */
import assert from 'node:assert/strict';
import { MemoryService } from '../js/population/memory-service.js';
import { GenerationService } from '../js/population/generation-service.js';
import { FactionService } from '../js/governance/faction-service.js';

const memory = new MemoryService();
let person = { id: 'person-1', memories: [] };
person = memory.remember(person, {
	type: 'aid',
	subjectId: 'person-2',
	summary: 'Shared water during drought',
	importance: 90
});
assert.equal(person.memories.length, 1);
assert.equal(memory.compress(person.memories).counts.aid, 1);

const generations = new GenerationService();
const shares = generations.inherit(
	{ resource: 'coin', quantity: 10 },
	[
		{ id: 'heir-1' },
		{ id: 'heir-2' },
		{ id: 'heir-3' }
	]
);
assert.equal(
	shares.reduce((total, share) => total + share.quantity, 0),
	10
);
assert.equal(generations.successor(
	{ id: 'leader' },
	[
		{ id: 'candidate-b', eligible: true, trust: 70 },
		{ id: 'candidate-a', eligible: true, trust: 70 }
	]
).id, 'candidate-a');

const factions = new FactionService();
const care = factions.create({
	name: 'Care Coalition',
	priorities: ['clinic'],
	influence: 40,
	trust: 80
}, 'faction-care');
const roads = factions.create({
	name: 'Road Guild',
	priorities: ['road'],
	influence: 30,
	trust: 70
}, 'faction-road');
const result = factions.mediate([care, roads], ['clinic', 'road']);
assert.equal(result.selected, 'clinic');
console.log(
	'B"H · Typed memory, generations, succession, and factions verified.'
);
