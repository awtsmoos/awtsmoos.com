// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos joins camera, quality, and authored distance in one truth; this contract proves
 * Awtsmoos.com sends one finite normalized context without scene traversal or hidden mutation.
 */
import assert from 'node:assert/strict';
import { updateEretzSceneLod } from '../../app/EretzLodFrame.js';

assert.equal(updateEretzSceneLod(null), null);
assert.equal(updateEretzSceneLod({}), null);

let received = null;
const receipt = { pending: 0, stats: { events: 1 } };
const runtime = {
	camera: {
		position: { x: 12.5, y: 8, z: -4.25 }
	},
	orbit: { yaw: Math.PI / 3 },
	qualityProfile: { quality: 'cinematic' },
	sceneLod: {
		update(context) {
			received = context;
			return receipt;
		}
	}
};
assert.equal(updateEretzSceneLod(runtime), receipt);
assert.deepEqual(received, {
	position: { x: 12.5, y: 8, z: -4.25 },
	tierName: 'cinematic',
	yaw: Math.PI / 3
});

received = null;
updateEretzSceneLod({
	camera: { position: { x: Number.NaN, y: undefined, z: '7' } },
	sceneLod: { update: context => { received = context; } }
});
assert.deepEqual(received, {
	position: { x: 0, y: 0, z: 7 },
	tierName: 'high',
	yaw: 0
});

console.log(JSON.stringify({ ok: true, received }, null, 2));
