// B"H
// Headless smoke test for CourseRuntimeMount: mounts each course against a
// stub runtime + stub DOM, runs frames, and unmounts — catching reference
// errors without a browser.

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	installCourseMenuCard,
	mountCourseRuntime,
	requestedCourseId
} from '../CourseRuntimeMount.js';
import { courseIds } from '../courseDefinitions.js';

function stubElement() {
	const children = [];
	const el = {
		children,
		dataset: {},
		innerHTML: '',
		textContent: '',
		className: '',
		id: '',
		style: {},
		setAttribute() {},
		appendChild(child) { children.push(child); return child; },
		remove() { el.removed = true; },
		querySelector() { return stubElement(); },
		addEventListener() {},
		removeEventListener() {}
	};
	return el;
}

function stubDocument() {
	const byId = {
		hud: stubElement(),
		meadowMenu: stubElement()
	};
	// Model live id lookup: appending an element with an id registers it.
	const registerIds = el => {
		if (el.id) byId[el.id] = el;
		for (const child of el.children || []) registerIds(child);
	};
	for (const key of Object.keys(byId)) {
		const el = byId[key];
		const originalAppend = el.appendChild.bind(el);
		el.appendChild = child => {
			const result = originalAppend(child);
			registerIds(child);
			return result;
		};
	}
	return {
		hidden: false,
		body: stubElement(),
		createElement: () => stubElement(),
		getElementById: id => byId[id] || null,
		addEventListener() {},
		removeEventListener() {}
	};
}

function stubRuntime() {
	const added = [];
	return {
		runtime: {
			state: {
				x: 0, y: 0, z: 0, renderY: 0, velY: 0,
				grounded: true, facing: 0,
				courseFriction: null, courseInvulnUntil: 0
			},
			scene: {
				add(obj) { added.push(obj); },
				remove(obj) {
					const i = added.indexOf(obj);
					if (i >= 0) added.splice(i, 1);
				}
			},
			options: { environment: {} },
			courseEngine: null
		},
		added
	};
}

function stubEnvironment(courseId) {
	return {
		document: stubDocument(),
		location: {
			search: courseId ? `?course=${courseId}` : '',
			pathname: '/games/mitzvahWorld/index.html',
			href: `http://localhost/games/mitzvahWorld/index.html${courseId ? `?course=${courseId}` : ''}`
		}
	};
}

test('requestedCourseId reads ?course=', () => {
	assert.equal(requestedCourseId(stubEnvironment('river-gap')), 'river-gap');
	assert.equal(requestedCourseId(stubEnvironment(null)), null);
});

for (const courseId of courseIds()) {
	test(`mounts, frames, and unmounts ${courseId}`, () => {
		const { runtime, added } = stubRuntime();
		const environment = stubEnvironment(courseId);
		const receipt = mountCourseRuntime(runtime, environment, courseId);
		assert.equal(receipt.ok, true, receipt.reason);
		assert.ok(runtime.courseEngine, 'engine mounted on runtime');
		assert.ok(added.length === 1, 'one course group added to the scene');
		const engine = runtime.courseEngine;
		// Player teleported to the course spawn.
		assert.ok(Math.abs(runtime.state.z - engine.def.spawn.z) < 1e-9);
		// Run 3 simulated seconds of frames through the real hooks.
		for (let i = 0; i < 180; i++) {
			engine.beforePlayerFrame(runtime.state, 1 / 60);
			engine.afterPlayerFrame(runtime.state, 1 / 60);
		}
		assert.ok(engine.courseTime > 2.9, `courseTime=${engine.courseTime}`);
		// Unknown course id is refused cleanly.
		const bad = mountCourseRuntime(runtime, environment, 'nope');
		assert.equal(bad.ok, false);
		receipt.unmount();
		assert.equal(runtime.courseEngine, null);
		assert.equal(added.length, 0, 'group removed from the scene');
	});
}

test('installCourseMenuCard renders three course links', () => {
	const documentValue = stubDocument();
	const host = documentValue.getElementById('meadowMenu');
	installCourseMenuCard(documentValue, stubEnvironment(null));
	assert.equal(host.children.length, 1);
	const card = host.children[0];
	assert.equal(card.id, 'courseMenuCard');
	assert.ok(card.innerHTML.includes('meadow-dash'));
	assert.ok(card.innerHTML.includes('river-gap'));
	assert.ok(card.innerHTML.includes('canopy-climb'));
	// Second install is a no-op (no duplicates).
	installCourseMenuCard(documentValue, stubEnvironment(null));
	assert.equal(host.children.length, 1);
});
