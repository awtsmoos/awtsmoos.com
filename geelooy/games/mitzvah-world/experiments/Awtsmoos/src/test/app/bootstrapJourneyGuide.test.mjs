// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapJourneyGuide.test.mjs
 * @description Proves one tiny card can teach first movement and then become the canonical quest voice through every mission phase.
 * The Awtsmoos lets one lantern change its words without multiplying panels across the sky;
 * Awtsmoos.com proves onboarding yields to Reb Mendel, objective, return, and fulfillment as the real quest passes by.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { BootstrapJourneyGuide } from '../../app/BootstrapJourneyGuide.js';

test('onboarding advances from wake to path to open valley by actual travel', () => {
	const runtime = onboardingRuntime();
	const guide = new BootstrapJourneyGuide(runtime);
	assert.equal(guide.describe().eyebrow, 'The valley wakes');
	runtime.state.x = 8;
	assert.equal(guide.describe().eyebrow, 'The first path');
	runtime.state.x = 24;
	assert.equal(guide.describe().eyebrow, 'The valley opens');
});

test('moving reveals the path and selected danger takes immediate priority', () => {
	const runtime = onboardingRuntime();
	const guide = new BootstrapJourneyGuide(runtime);
	runtime.state.moving = true;
	assert.equal(guide.describe().eyebrow, 'The first path');
	runtime.enemies = { selected: { profile: { name: 'Guardian' } } };
	assert.equal(guide.describe().eyebrow, 'A presence stirs');
	assert.match(guide.describe().objective, /Guardian/);
});

test('available canonical quest points toward Reb Mendel before the offer', () => {
	const runtime = questRuntime(snapshot('available'));
	const guide = new BootstrapJourneyGuide(runtime);
	assert.match(guide.describe().eyebrow, /Reb Mendel/);
	assert.match(guide.describe().objective, /Find Reb Mendel/);
});

test('real quest offer reveals canonical chapter and opening story', () => {
	const runtime = questRuntime(snapshot('available'));
	runtime.directContextAction = { hasOffer: () => true };
	const beat = new BootstrapJourneyGuide(runtime).describe();
	assert.equal(beat.eyebrow, 'The Road Learns Intention');
	assert.match(beat.objective, /eastern road/i);
	assert.match(beat.hint, /Begin/);
});

test('active quest projects current objective and progress instead of tutorial copy', () => {
	const runtime = questRuntime(snapshot('active', {
		currentObjective: {
			count: 3,
			description: 'Read the three enemy rhythms.',
			progress: 1
		},
		phase: 'defeat'
	}));
	const beat = new BootstrapJourneyGuide(runtime).describe();
	assert.equal(beat.objective, 'Read the three enemy rhythms.');
	assert.match(beat.hint, /1\/3/);
});

test('ready and completed phases collapse into simple return and fulfillment beats', () => {
	const runtime = questRuntime(snapshot('ready', { phase: 'return' }));
	const guide = new BootstrapJourneyGuide(runtime);
	assert.match(guide.describe().objective, /Return to Reb Mendel/);
	runtime.quest.snapshot = () => snapshot('completed', { phase: 'completed' });
	assert.equal(guide.describe().eyebrow, 'Shlichus fulfilled');
});

function onboardingRuntime() {
	return { state: { moving: false, x: 0, z: 0 } };
}

function questRuntime(currentSnapshot) {
	const definition = {
		giver: { name: 'Reb Mendel the Watchman' },
		name: 'The Road Learns Intention',
		story: {
			chapter: 'The Road Learns Intention',
			opening: 'Three unfamiliar rhythms now move along the eastern road.',
			purpose: 'Learn before acting.'
		}
	};
	return {
		quest: {
			definition,
			snapshot: () => ({ ...currentSnapshot, definition })
		},
		state: { x: 0, z: 0 }
	};
}

function snapshot(status, overrides = {}) {
	return {
		currentObjective: null,
		phase: status,
		status,
		...overrides
	};
}
