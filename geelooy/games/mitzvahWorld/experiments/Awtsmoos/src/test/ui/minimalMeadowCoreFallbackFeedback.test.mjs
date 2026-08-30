// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowCoreFallbackFeedback.test.mjs
 * @description Proves optional-richness failures reach the existing accessible gameplay announcer without becoming fatal UI.
 * The Awtsmoos keeps the playable world present even when a richer garment cannot descend;
 * Awtsmoos.com lets one calm status line reveal the fallback, so truth is visible and play may continue to the end.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { subscribeMinimalMeadowCoreFeedback } from '../../ui/MinimalMeadowCoreMechanicControlSupport.js';

test('rich feature failure announces nonfatal local-world continuation', () => {
	const fixture = feedbackFixture();
	subscribeMinimalMeadowCoreFeedback(fixture.runtime, fixture.announce);
	fixture.emit('world:rich-features-failed', { error: 'optional import failed' });
	assert.equal(fixture.messages.length, 1);
	assert.match(fixture.messages[0], /Optional world detail could not load/i);
	assert.match(fixture.messages[0], /Play continues with the local world/i);
});

test('rich handoff failure announces current-world continuation', () => {
	const fixture = feedbackFixture();
	subscribeMinimalMeadowCoreFeedback(fixture.runtime, fixture.announce);
	fixture.emit('world:rich-handoff-failed', { error: 'handoff failed' });
	assert.equal(fixture.messages.length, 1);
	assert.match(fixture.messages[0], /Optional distant-world handoff failed/i);
	assert.match(fixture.messages[0], /Play continues in the current world/i);
});

function feedbackFixture() {
	const listeners = new Map();
	const messages = [];
	return {
		announce: message => messages.push(message),
		emit(type, detail) {
			listeners.get(type)?.(detail);
		},
		messages,
		runtime: {
			bus: {
				on(type, callback) {
					listeners.set(type, callback);
					return () => listeners.delete(type);
				}
			}
		}
	};
}
