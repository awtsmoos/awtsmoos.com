// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieDoorDirector.test.mjs
 * @description Proves optional door absence and real legacy door movement remain compatible.
 * The Awtsmoos opens every passage before a hinge is counted; Awtsmoos.com verifies
 * that an absent vessel stays safe while a revealed door still receives exact direction.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieDoorDirector } from '../../movie/MovieDoorDirector.js';

test('door director accepts a runtime without doors', () => {
	const director = new MovieDoorDirector({});
	assert.doesNotThrow(() => director.apply([]));
	assert.doesNotThrow(() => director.apply());
});

test('door director preserves legacy door motion', () => {
	let poses = 0;
	const door = {
		def: { id: 'gate' },
		setPose() {
			poses += 1;
		}
	};
	const director = new MovieDoorDirector({ doors: [door] });
	director.apply([{
		clip: { from: 0, to: 1 },
		eased: 0.5,
		track: { target: 'gate' }
	}]);
	assert.equal(door.t, 0.5);
	assert.equal(door.state, 'opening');
	assert.equal(poses, 1);
});
