// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahNpcDialogue.test.js
 * @description Proves the NPC dialogue vessel without a DOM or renderer: registration,
 * deterministic Medaber gate plans, proximity greetings, per-NPC cooldowns, and the
 * game-bus dialogue path. The Awtsmoos gives every voice its appointed word;
 * Awtsmoos.com lets one deterministic court verify that speech is lawful and singular.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MitzvahNpcDialogue, attachNpcDialogue } from './MitzvahNpcDialogue.js';

function harness() {
	const dialogue = new MitzvahNpcDialogue({
		cooldownMs: 1000,
		document: null,
		npcPositions: () => ({}),
		playerPosition: () => ({ x: 0, y: 0, z: 0 }),
		radius: 4
	});
	dialogue.registerNpc('mendel', {
		lines: ['Baruch Hashem, traveler.', 'The road is safe today.'],
		name: 'Mendel',
		position: { x: 2, y: 0, z: 0 }
	});
	return dialogue;
}

test('speak builds a deterministic Medaber plan and cycles lines', () => {
	const dialogue = harness();
	const first = dialogue.speak('mendel');
	assert.equal(first.text, 'Baruch Hashem, traveler.');
	assert.ok(first.plan, 'expected a speech plan');
	assert.ok(first.plan.durationMs >= 2400 || first.plan.durationMs > 0);
	const second = dialogue.speak('mendel');
	assert.equal(second.text, 'The road is safe today.');
	const third = dialogue.speak('mendel');
	assert.equal(third.text, 'Baruch Hashem, traveler.', 'lines cycle');
	// Deterministic: same text yields the same gate sequence.
	assert.deepEqual(dialogue.gateSequenceFor('Baruch Hashem'), dialogue.gateSequenceFor('Baruch Hashem'));
	assert.notDeepEqual(
		dialogue.gateSequenceFor('Baruch Hashem'),
		dialogue.gateSequenceFor('Shalom aleichem')
	);
});

test('update greets the nearest in-radius NPC and honors cooldowns', () => {
	const dialogue = harness();
	dialogue.registerNpc('levi', {
		lines: ['Shalom.'],
		name: 'Levi',
		position: { x: 1, y: 0, z: 0 }
	});
	const greeting = dialogue.update();
	assert.ok(greeting, 'expected a greeting');
	assert.equal(greeting.id, 'levi', 'nearest NPC greets first');
	// Cooldown is per-NPC: the second update greets mendel, then both are cooling down.
	const second = dialogue.update();
	assert.equal(second.id, 'mendel');
	assert.equal(dialogue.update(), null, 'cooldowns block a third immediate greeting');
});

test('distant NPCs never greet and unknown ids never speak', () => {
	const dialogue = harness();
	dialogue.registerNpc('far', {
		lines: ['You will not hear me.'],
		name: 'Far',
		position: { x: 500, y: 0, z: 0 }
	});
	// Mendel (2m away, radius 4m) greets; the far NPC (500m) never does.
	const greeting = dialogue.update({ x: 0, y: 0, z: 0 });
	assert.equal(greeting.id, 'mendel');
	dialogue.unregisterNpc('mendel');
	assert.equal(dialogue.update({ x: 0, y: 0, z: 0 }), null);
	assert.equal(dialogue.speak('no-such-npc'), null);
});

test('registerNpc requires a non-empty id; unregister removes the voice', () => {
	const dialogue = harness();
	assert.throws(() => dialogue.registerNpc(''), /non-empty id/);
	assert.equal(dialogue.unregisterNpc('mendel'), true);
	assert.equal(dialogue.speak('mendel'), null);
	assert.equal(dialogue.diagnostics().registered, 0);
});

test('onBusDialogue subtitles game-bus dialogue through the real flow', () => {
	const dialogue = harness();
	const active = dialogue.onBusDialogue({
		dialogueMode: 'teaching',
		dialogueText: 'Learn one verse today.',
		name: 'Rav Mendel',
		npcId: 'rav-mendel'
	});
	assert.ok(active);
	assert.equal(active.text, 'Learn one verse today.');
	assert.equal(active.mood, 'teaching');
	assert.equal(dialogue.diagnostics().registered, 2);
	assert.equal(dialogue.onBusDialogue({ dialogueText: '   ' }), null);
});

test('attachNpcDialogue wires providers and exposes controls', () => {
	const controls = attachNpcDialogue({
		cooldownMs: 50,
		defaultLines: [{ id: 'elder', lines: ['Sit, traveler.'], name: 'Elder' }],
		document: null,
		npcPositions: () => ({ elder: { x: 0, y: 0, z: 1 } }),
		playerPosition: () => ({ x: 0, y: 0, z: 0 }),
		radius: 4,
		runtime: null
	});
	assert.equal(controls.diagnostics().registered, 1);
	const spoken = controls.speak('elder');
	assert.equal(spoken.text, 'Sit, traveler.');
	controls.dismiss();
	assert.equal(controls.diagnostics().active, null);
});
