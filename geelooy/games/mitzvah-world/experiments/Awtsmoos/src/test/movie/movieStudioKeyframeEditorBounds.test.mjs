// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieStudioKeyframeController } from '../../movie/MovieStudioKeyframeController.js';

function session() {
	return {
		commands: { commitProject() {} },
		events: { emit() {} },
		project: {
			authoring3d: {
				keyframes: [
					{ easing: 'linear', id: 'key-a', targetId: 'hero', time: 1, type: 'transform', value: { position: { x: 0, y: 0, z: 0 } } },
					{ easing: 'smoothstep', id: 'key-b', targetId: 'hero', time: 3, type: 'transform', value: { position: { x: 2, y: 0, z: 0 } } }
				]
			},
			duration: 10,
			tracks: []
		},
		revision: 1,
		seek() {},
		time: 0,
		view: { status: { textContent: '' } }
	};
}

test('keyframe editor renders bounded slider, easing, target, and value controls', () => {
	const view = {
		keyframeEditor: {
			addEventListener() {},
			innerHTML: '',
			removeEventListener() {}
		}
	};
	new MovieStudioKeyframeController(session(), view);
	assert.match(view.keyframeEditor.innerHTML, /data-keyframe-field="time"/);
	assert.match(view.keyframeEditor.innerHTML, /max="10"/);
	assert.match(view.keyframeEditor.innerHTML, /data-keyframe-field="easing"/);
	assert.match(view.keyframeEditor.innerHTML, /smoothstep/);
	assert.match(view.keyframeEditor.innerHTML, /data-keyframe-field="targetId"/);
	assert.match(view.keyframeEditor.innerHTML, /data-keyframe-field="value"/);
});
