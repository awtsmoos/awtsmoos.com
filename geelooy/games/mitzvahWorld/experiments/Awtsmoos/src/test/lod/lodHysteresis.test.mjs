// B"H
import assert from 'node:assert/strict';
import {
	idealLevelIndex,
	selectLodLevel
} from '../../lod/LodHysteresis.js';

const levels = [
	{ maximumDistance: 50 },
	{ maximumDistance: 100 },
	{ maximumDistance: Infinity }
];

assert.equal(idealLevelIndex(20, levels), 0);
assert.equal(idealLevelIndex(80, levels), 1);
assert.equal(idealLevelIndex(180, levels), 2);

assert.equal(select(49, 0), 0);
assert.equal(select(54, 0), 0, 'outward movement should remain inside hysteresis');
assert.equal(select(56, 0), 1, 'outward movement should cross expanded boundary');
assert.equal(select(46, 1), 1, 'inward movement should remain inside hysteresis');
assert.equal(select(44, 1), 0, 'inward movement should cross contracted boundary');
assert.equal(select(112, 1), 2);
assert.equal(select(88, 2), 1);

assert.equal(selectLodLevel({ distance: 10, levels: [], currentIndex: 4 }), 0);
assert.equal(selectLodLevel({ distance: NaN, levels, currentIndex: 0 }), 2);
assert.equal(selectLodLevel({ distance: 10, levels, currentIndex: 99 }), 0);

console.log(JSON.stringify({
	ok: true,
	levels,
	outwardSwitch: select(56, 0),
	inwardSwitch: select(44, 1)
}, null, 2));

function select(distance, currentIndex) {
	return selectLodLevel({
		distance,
		levels,
		currentIndex,
		hysteresis: 0.1
	});
}
