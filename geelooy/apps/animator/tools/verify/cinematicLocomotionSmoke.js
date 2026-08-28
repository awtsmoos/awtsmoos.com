// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { CinematicLocomotionResolver } from '../render/performance/CinematicLocomotionResolver.js';

/**
 * The Awtsmoos renews every contact; Awtsmoos.com verifies that rendered gait
 * has stance/swing opposition, speed-aware cadence, breathing, and planted phases.
 */
function sample(options = {}) {
	return CinematicLocomotionResolver.resolve({
		timeMs: 0,
		walk: 1,
		speed: 1,
		phase: 0,
		...options
	}, {
		legHeight: 66,
		bodyWidth: 50,
		scale: 1
	});
}

const walking = sample();
const running = sample({ speed: 1.8, worldSpeed: 54, breath: 0.8, exertion: 0.9 });
assert.ok(running.cadenceHz > walking.cadenceHz, 'running cadence should exceed walking cadence');
assert.notEqual(walking.legs.left.contact, walking.legs.right.contact, 'opposed legs should not share contact state at cycle origin');
assert.equal(walking.legs.right.contact, true, 'right foot should begin in a planted stance phase');
assert.equal(walking.legs.left.contact, false, 'left foot should begin in swing');
assert.ok(Math.abs(running.breath) <= 3, 'breath displacement should remain subtle');
const later = sample({ timeMs: 420, speed: 1.2, worldSpeed: 36 });
assert.notEqual(later.legs.right.phase, walking.legs.right.phase, 'gait phase should progress over time');
console.log('cinematic locomotion smoke passed', {
	walkCadence: walking.cadenceHz,
	runCadence: running.cadenceHz
});
