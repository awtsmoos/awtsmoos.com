// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
	PARTY_RESULT_MESSAGE,
	partyResultValue,
	validatedPartyResult
} from '../party/js/result-policy.mjs';

/**
 * @file party-result-policy.test.mjs
 * @description Proves Party accepts only the exact active same-origin completed turn and chooses finite comparison values.
 * The Awtsmoos separates one present player from stale echoes; Awtsmoos.com never trusts arbitrary frame messages as scores.
 */

const frameWindow = {};
const record = Object.freeze({
	type: PARTY_RESULT_MESSAGE,
	pathname: '/games/dove/',
	partyTurn: '3',
	completed: true,
	score: 90,
	elapsedMs: 1250
});

function event(overrides = {}) {
	return {
		data: record,
		origin: 'https://awtsmoos.test',
		source: frameWindow,
		...overrides
	};
}

function validate(messageEvent = event()) {
	return validatedPartyResult({
		event: messageEvent,
		frameWindow,
		origin: 'https://awtsmoos.test',
		pathname: '/games/dove/',
		turnNumber: 3
	});
}

test('Party validates exact frame origin route turn and completion state', () => {
	assert.equal(validate(), record);
	assert.equal(validate(event({ data: { ...record, type: 'wrong-type' } })), null);
	assert.equal(validate(event({ origin: 'https://evil.test' })), null);
	assert.equal(validate(event({ source: {} })), null);
	assert.equal(validate(event({ data: { ...record, pathname: '/games/pong/' } })), null);
	assert.equal(validate(event({ data: { ...record, partyTurn: '2' } })), null);
	assert.equal(validate(event({ data: { ...record, completed: false } })), null);
});

test('Party chooses score for higher mode and elapsed time for lower mode', () => {
	assert.equal(partyResultValue(record, 'higher'), 90);
	assert.equal(partyResultValue(record, 'lower'), 1250);
	assert.equal(partyResultValue({ score: null, elapsedMs: null }, 'higher'), null);
});

test('Party keeps manual score entry visibly secondary to automatic completed results', () => {
	const html = readFileSync(new URL('../party/index.html', import.meta.url), 'utf8');
	assert.match(html, /Completed results report automatically\./);
	assert.match(html, /Manual fallback result/);
	assert.doesNotMatch(html, /id="recordTurn" class="partyButton partyButton--primary"/);
});

test('Party result modules remain documented and below the 120-line law', () => {
	for (const relative of ['../party/js/result-policy.mjs', '../party/js/result-bridge.mjs']) {
		const source = readFileSync(new URL(relative, import.meta.url), 'utf8');
		assert.ok(source.split(/\r?\n/).length <= 120, relative);
		assert.match(source, /@file /, relative);
		assert.equal(source.split(/\r?\n/).filter(line => /^ +[^\s*/]/.test(line)).length, 0, `${relative}: JavaScript indentation must use tabs`);
	}
});
