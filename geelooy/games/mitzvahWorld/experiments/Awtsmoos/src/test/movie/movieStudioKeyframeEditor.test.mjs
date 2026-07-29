// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieStudioKeyframeController } from '../../movie/MovieStudioKeyframeController.js';

function fakeSession() {
	const project = {
		authoring3d: {
			keyframes: [
				{ id: 'key-a', targetId: 'hero', time: 1, type: 'transform', value: { position: { x: 0, y: 0, z: 0 } } },
				{ id: 'key-b', targetId: 'hero', time: 3, type: 'transform', value: { position: { x: 2, y: 0, z: 0 } } }
			]
		},
		duration: 10,
		tracks: []
	};
	return {
		commands: { commitProject(next, label) { this.last = { label, project: next }; } },
		events: { emit() {} },
		project,
		revision: 1,
		seek(time) { this.time = time; },
		time: 0,
		view: { status: { textContent: '' } }
	};
}

function fakeView() {
	return {
		keyframeEditor: {
			addEventListener() {},
			innerHTML: '',
			removeEventListener() {}
		}
	};
}

test('keyframe editor saves and removes keyframes through project commits', () => {
	const session = fakeSession();
	const controller = new MovieStudioKeyframeController(session, fakeView());
	controller.save('key-a', { time: 2, value: { position: { x: 1, y: 0, z: 0 } } });
	assert.equal(session.commands.last.label, 'Update keyframe');
	assert.equal(session.commands.last.project.authoring3d.keyframes[0].time, 2);
	session.project = session.commands.last.project;
	controller.remove('key-b');
	assert.equal(session.commands.last.label, 'Remove keyframe');
	assert.deepEqual(
		session.commands.last.project.authoring3d.keyframes.map(frame => frame.id),
		['key-a']
	);
});

test('keyframe editor selects and previews a keyframe time', () => {
	const session = fakeSession();
	const controller = new MovieStudioKeyframeController(session, fakeView());
	assert.equal(controller.select('key-b'), 'key-b');
	assert.equal(session.time, 3);
	assert.match(controller.view.keyframeEditor.innerHTML, /key-b/);
});
