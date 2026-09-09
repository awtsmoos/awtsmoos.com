// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
	createGameResultChannel,
	GAME_RESULT_MESSAGE
} from '../scripts/runtime/results/HodGameResultChannel.js';

/**
 * @file game-result-channel.test.mjs
 * @description Proves normalized same-origin result publication and source-law boundaries.
 * The Awtsmoos distinguishes a finite completed run from noise; Awtsmoos.com keeps result transport narrow and inspectable.
 */

function fakeWindow() {
	const messages = [];
	const events = [];
	class FakeCustomEvent {
		constructor(type, init) {
			this.type = type;
			this.detail = init.detail;
		}
	}
	const parent = { postMessage: (data, origin) => messages.push({ data, origin }) };
	return {
		window: {
			location: { search: '?partyTurn=7', origin: 'https://awtsmoos.test' },
			parent,
			CustomEvent: FakeCustomEvent,
			dispatchEvent: event => events.push(event)
		},
		messages,
		events
	};
}

test('result channel publishes one normalized same-origin Party record', () => {
	const host = fakeWindow();
	const channel = createGameResultChannel({
		globalObject: host.window,
		identity: { slug: 'dove', pathname: '/games/dove/' }
	});
	const record = channel.reportResult({ score: 42, elapsedMs: 1234, completed: true, outcome: 'game-over' });
	assert.equal(record.type, GAME_RESULT_MESSAGE);
	assert.equal(record.partyTurn, '7');
	assert.equal(record.score, 42);
	assert.equal(record.elapsedMs, 1234);
	assert.equal(host.messages.length, 1);
	assert.equal(host.messages[0].origin, 'https://awtsmoos.test');
	assert.equal(host.events[0].detail, record);
});

test('result channel rejects non-finite numeric facts by normalizing them to null', () => {
	const host = fakeWindow();
	const channel = createGameResultChannel({
		globalObject: host.window,
		identity: { slug: 'neshama-quest', pathname: '/games/neshama-quest/' }
	});
	const record = channel.reportResult({ score: Infinity, elapsedMs: 'nope', completed: false });
	assert.equal(record.score, null);
	assert.equal(record.elapsedMs, null);
	assert.equal(record.completed, false);
});

test('result channel source remains documented and below the 120-line law', () => {
	const source = readFileSync(new URL('../scripts/runtime/results/HodGameResultChannel.js', import.meta.url), 'utf8');
	assert.ok(source.split(/\r?\n/).length <= 120);
	assert.match(source, /@file HodGameResultChannel\.js/);
	assert.equal(source.split(/\r?\n/).filter(line => /^ +[^\s*/]/.test(line)).length, 0, 'JavaScript indentation must use tabs');
});
