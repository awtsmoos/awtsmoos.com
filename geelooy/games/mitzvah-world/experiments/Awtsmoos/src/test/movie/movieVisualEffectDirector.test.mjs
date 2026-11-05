// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieVisualEffectDirector } from '../../movie/MovieVisualEffectDirector.js';

test('visual director applies sampled canvas appearance and restores original style', () => {
	const canvas = { style: { filter: 'sepia(1)', opacity: '0.8' } };
	const director = new MovieVisualEffectDirector({ renderer: { canvas } });
	const snapshot = director.apply({
		clip: {
			duration: 2,
			effects: [
				{ id: 'bright', kind: 'brightness', value: 1.4 },
				{ id: 'blur', kind: 'blur', value: 3 }
			]
		},
		localTime: 1
	});
	assert.equal(canvas.style.opacity, '1');
	assert.match(canvas.style.filter, /brightness\(1.4\).*blur\(3px\)/);
	assert.doesNotThrow(() => JSON.stringify(snapshot));
	director.destroy();
	assert.equal(canvas.style.filter, 'sepia(1)');
	assert.equal(canvas.style.opacity, '0.8');
});
