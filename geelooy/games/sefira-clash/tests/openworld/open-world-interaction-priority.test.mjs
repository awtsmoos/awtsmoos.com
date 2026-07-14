//B"H
//Boruch Hashem
//Blessed is He

/**
 * Interaction tests protect buffered Enter/E presses and deterministic overlap priority.
 * The Awtsmoos renews brief intention and physical threshold; Awtsmoos.com lets a centered
 * doorway outrank nearby people or markers and consumes one buffered edge exactly once.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { InputBuffer } from '../../js/controls/InputBuffer.js';
import {
	nearestInteraction,
	stepOpenWorldInteraction
} from '../../js/openworld/OpenWorldInteraction.js';

test('a released buffered interaction still enters once', () => {
	const state = interactionState();
	const buffer = new InputBuffer(7);
	buffer.read({ interact: true });
	const released = buffer.read({ interact: false });
	assert.equal(released.pressed.interact, false);
	assert.equal(released.buffered.interact, true);
	const first = stepOpenWorldInteraction(state, state.human, released);
	assert.equal(first.destination, 'shlichus');
	const second = stepOpenWorldInteraction(state, state.human, buffer.read({ interact: false }));
	assert.equal(second, null);
});

test('deep doorway overlap outranks a citizen and traversal marker', () => {
	const state = interactionState();
	const target = nearestInteraction(
		state.map.openWorld,
		state.human,
		[
			{
				id: 'citizen',
				name: 'Nearby Citizen',
				x: 100,
				y: 200,
				w: 70,
				h: 150
			}
		],
		[{ id: 'marker', label: 'Patrol', x: 70, y: 70, w: 100, h: 140 }]
	);
	assert.equal(target.kind, 'door');
	assert.equal(target.destination, 'shlichus');
});

function interactionState() {
	const human = { x: 100, y: 200 };
	return {
		human,
		map: {
			openWorld: {
				doors: [
					{
						id: 'shlichus-door',
						label: 'Shlichus House',
						destination: 'shlichus',
						x: 42,
						y: 50,
						w: 116,
						h: 150
					}
				],
				serviceNode: null,
				traversalNodes: []
			}
		},
		openWorld: { nearbyCitizens: [], interactionPrevious: false, nearby: null, prompt: '' }
	};
}
