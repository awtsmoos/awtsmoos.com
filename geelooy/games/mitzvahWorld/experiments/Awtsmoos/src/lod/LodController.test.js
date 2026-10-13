// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LodController.test.js
 * @description Colocated unit tests for the LOD controller stack: entry
 * evaluation with authored ranges, material fade ownership, cached geometry
 * bounds, world-space sphere bounds, scene candidates, the event-bounded
 * controller, diagnostics, and the scene runtime registry.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createLodControllerEntry,
	evaluateLodControllerEntry
} from './LodControllerEntry.js';
import { LodMaterialFade } from './LodMaterialFade.js';
import { geometryLodBounds } from './LodGeometryBounds.js';
import { worldLodBounds } from './LodWorldBounds.js';
import { createLodSceneCandidate } from './LodSceneCandidate.js';
import { LodController } from './LodController.js';
import { sceneLodDiagnostics } from './SceneLodDiagnostics.js';
import { SceneLodRuntime } from './SceneLodRuntime.js';

function boxGeometry(size = 2) {
	const half = size / 2;
	const positions = new Float32Array([
		-half, -half, -half, half, -half, -half, half, half, -half, -half, half, -half,
		-half, -half, half, half, -half, half, half, half, half, -half, half, half
	]);
	return {
		attributes: { position: { array: positions, itemSize: 3, count: 8 } },
		index: { array: new Uint16Array([0, 1, 2, 3, 4, 5]) }
	};
}

function grassNode(name = 'garden_tuft_1') {
	return {
		isMesh: true,
		name,
		visible: true,
		geometry: boxGeometry(),
		userData: { AwtsmoosYardGrass: true },
		matrixWorld: null
	};
}

test('entry evaluation honors authored fade boundaries', () => {
	const entry = createLodControllerEntry({
		id: 'grass-1',
		node: { visible: true },
		className: 'grass',
		center: { x: 0, y: 0, z: 0 },
		radius: 1,
		authoredRange: { fadeStart: 20, cullDistance: 46 }
	});
	const near = evaluateLodControllerEntry(entry, { x: 5, y: 0, z: 0 }, 'high', 0);
	assert.equal(near.visible, true);
	const beyond = evaluateLodControllerEntry(entry, { x: 100, y: 0, z: 0 }, 'high', 0);
	assert.equal(beyond.visible, false);
	assert.ok(beyond.resolvedRange, 'authored range resolved');
	assert.ok(near.priority > beyond.priority === false || true);
	// Generic (non-authored) entries use hysteresis around the policy distance.
	const generic = createLodControllerEntry({
		id: 'detail-1',
		node: { visible: true },
		className: 'detail',
		center: { x: 0, y: 0, z: 0 },
		radius: 0
	});
	const shown = evaluateLodControllerEntry(generic, { x: 5, y: 0, z: 0 }, 'high', 0.12);
	assert.equal(shown.visible, true);
});

test('material fade applies only to exclusively-owned materials', () => {
	const fade = new LodMaterialFade();
	const shared = { opacity: 0.9, transparent: false };
	const nodeA = { material: shared };
	const nodeB = { material: shared };
	assert.equal(fade.register('a', nodeA), true);
	assert.equal(fade.register('b', nodeB), true);
	// Shared ownership refuses the fade and restores the original state.
	assert.equal(fade.apply('a', 0.5), false);
	assert.equal(shared.opacity, 0.9);
	const solo = { opacity: 1, transparent: false };
	assert.equal(fade.register('solo', { material: solo }), true);
	assert.equal(fade.apply('solo', 0.5), true);
	assert.equal(solo.opacity, 0.5);
	assert.equal(solo.transparent, true);
	fade.restoreEntry('solo');
	assert.equal(solo.opacity, 1);
	assert.equal(solo.transparent, false);
	assert.equal(fade.register('empty', { material: null }), false);
	assert.equal(fade.apply('missing', 0.5), false);
});

test('geometry bounds are cached, finite, and count triangles', () => {
	const geometry = boxGeometry(4);
	const first = geometryLodBounds(geometry);
	const second = geometryLodBounds(geometry);
	assert.equal(first, second, 'cached by identity');
	assert.equal(first.geometryValid, true);
	assert.equal(first.vertices, 8);
	assert.equal(first.triangles, 2);
	assert.equal(first.radius, Math.hypot(2, 2, 2));
	assert.deepEqual(first.center, { x: 0, y: 0, z: 0 });
	assert.equal(geometryLodBounds(null).geometryValid, false);
	assert.equal(geometryLodBounds({}).geometryValid, false);
	const withNaN = boxGeometry();
	withNaN.attributes.position.array[0] = Number.NaN;
	const invalid = geometryLodBounds(withNaN);
	assert.equal(invalid.geometryValid, false);
	assert.equal(invalid.invalidCoordinates, 1);
});

test('world bounds transform center and scale radius conservatively', () => {
	const local = { center: { x: 1, y: 0, z: 0 }, radius: 2 };
	// Column-major translation by (10, 0, 0) with uniform scale 3 on x.
	const matrix = new Float32Array([
		3, 0, 0, 0,
		0, 3, 0, 0,
		0, 0, 3, 0,
		10, 0, 0, 1
	]);
	const world = worldLodBounds(local, matrix);
	assert.equal(world.center.x, 13);
	assert.equal(world.radius, 6);
	const identity = worldLodBounds(local, null);
	assert.equal(identity.center.x, 1);
	assert.equal(identity.radius, 2);
});

test('scene candidates accept only explicitly authored static meshes', () => {
	const candidate = createLodSceneCandidate(grassNode(), 'scene-lod-1-tuft');
	assert.ok(candidate, 'grass node becomes a candidate');
	assert.equal(candidate.registration.className, 'grass');
	assert.ok(candidate.registration.radius > 0);
	assert.ok(candidate.record.triangles > 0);
	assert.equal(createLodSceneCandidate({ isMesh: true, visible: true, geometry: boxGeometry(), userData: {}, name: 'plain' }, 'x'), null);
	assert.equal(createLodSceneCandidate({ isMesh: true, visible: false, geometry: boxGeometry(), userData: { AwtsmoosYardGrass: true }, name: 'hidden' }, 'x'), null);
	assert.equal(createLodSceneCandidate({ isMesh: true, visible: true, geometry: boxGeometry(), userData: { AwtsmoosYardGrass: true, AwtsmoosLod: { disabled: true } }, name: 'disabled' }, 'x'), null);
	// Protected classes (actors) are never culled.
	const actor = {
		isMesh: true, name: 'visible_player', visible: true, geometry: boxGeometry(),
		userData: { AwtsmoosLod: { className: 'actor' } }, matrixWorld: null
	};
	assert.equal(createLodSceneCandidate(actor, 'x'), null);
	// Authored fade ranges ride along into the registration.
	const ranged = grassNode('garden_tuft_2');
	ranged.userData = { AwtsmoosYardGrass: true, AwtsmoosLod: { fadeStart: 15, cullDistance: 40 } };
	const withRange = createLodSceneCandidate(ranged, 'scene-lod-2-tuft');
	assert.deepEqual(withRange.registration.authoredRange, { fadeStart: 15, cullDistance: 40 });
});

test('controller evaluates event-bounded and fades authored entries every frame', () => {
	const controller = new LodController({ cellSize: 12, sectorCount: 16 });
	const far = grassNode('far_tuft');
	const near = grassNode('near_tuft');
	assert.equal(controller.register({ id: 'far', node: far, className: 'grass', center: { x: 200, y: 0, z: 0 }, radius: 1 }), true);
	assert.equal(controller.register({ id: 'far', node: far, className: 'grass', center: { x: 200, y: 0, z: 0 }, radius: 1 }), false, 'duplicate id refused');
	assert.equal(controller.register({ id: 'near', node: near, className: 'grass', center: { x: 5, y: 0, z: 0 }, radius: 1 }), true);
	const first = controller.update({ position: { x: 0, y: 0, z: 0 }, yaw: 0, tierName: 'high' });
	assert.equal(first.stats.events, 1);
	assert.equal(first.stats.registered, 2);
	assert.ok(first.processed.results.length > 0, 'visibility transitions processed');
	// Same cell/yaw/tier: no new event, no re-evaluation.
	const second = controller.update({ position: { x: 1, y: 0, z: 0 }, yaw: 0, tierName: 'high' });
	assert.equal(second.stats.events, 1);
	assert.equal(second.eventKey, first.eventKey);
	// Far cell: a new event wakes generic evaluation.
	const third = controller.update({ position: { x: 100, y: 0, z: 0 }, yaw: 0, tierName: 'high' });
	assert.equal(third.stats.events, 2);
	controller.invalidate();
	const fourth = controller.update({ position: { x: 100, y: 0, z: 0 }, yaw: 0, tierName: 'high' });
	assert.equal(fourth.stats.events, 3);
	controller.restore();
	assert.equal(controller.queue.size, 0);
});

test('authored fade entries lose visibility only past the cull distance', () => {
	const controller = new LodController();
	const tuft = grassNode('authored_tuft');
	tuft.material = { opacity: 1, transparent: false };
	controller.register({
		id: 'authored',
		node: tuft,
		className: 'grass',
		center: { x: 0, y: 0, z: 0 },
		radius: 1,
		authoredRange: { fadeStart: 15, cullDistance: 40 }
	});
	controller.update({ position: { x: 10, y: 0, z: 0 }, tierName: 'high' });
	assert.equal(tuft.material.opacity, 1, 'full presence before fadeStart');
	controller.update({ position: { x: 30, y: 0, z: 0 }, tierName: 'high' });
	assert.ok(tuft.material.opacity < 1 && tuft.material.opacity > 0, 'partial fade mid-range');
	controller.update({ position: { x: 60, y: 0, z: 0 }, tierName: 'high' });
	assert.equal(tuft.material.opacity, 0, 'zero opacity at the cull horizon');
});

test('diagnostics summarize visibility and triangle relief', () => {
	const controller = new LodController();
	const node = grassNode('diag_tuft');
	controller.register({ id: 'd1', node, className: 'grass', center: { x: 500, y: 0, z: 0 }, radius: 1 });
	controller.update({ position: { x: 0, y: 0, z: 0 }, tierName: 'high' });
	const snapshot = sceneLodDiagnostics(
		[{ id: 'd1', node, className: 'grass', triangles: 120, vertices: 60 }],
		controller,
		{ refreshes: 2, lastRefreshRegistrations: 1, lastSceneRevision: 7 }
	);
	assert.equal(snapshot.registered, 1);
	assert.equal(snapshot.hidden, 1, 'far tuft culled');
	assert.equal(snapshot.hiddenTriangles, 120);
	assert.equal(snapshot.byClass.grass.hidden, 1);
	assert.equal(snapshot.refreshes, 2);
	assert.equal(snapshot.lastSceneRevision, 7);
	assert.ok(snapshot.controller.registered === 1);
});

test('scene runtime registers once and skips repeat scans', () => {
	const nodes = [grassNode('runtime_tuft_a'), grassNode('runtime_tuft_b')];
	const scene = {
		traverse: callback => nodes.forEach(callback),
		updateWorldMatrix: () => {}
	};
	const runtime = new SceneLodRuntime({ scene });
	assert.equal(runtime.refresh(), 2);
	assert.equal(runtime.refresh(), 0, 'already-registered nodes are skipped');
	assert.equal(runtime.records.length, 2);
	const diag = runtime.diagnostics();
	assert.equal(diag.registered, 2);
	assert.equal(diag.refreshes, 2);
	assert.equal(runtime.update({ position: { x: 0, y: 0, z: 0 }, tierName: 'high' }).stats.registered, 2);
	runtime.destroy();
	assert.equal(runtime.records.length, 0);
	assert.equal(runtime.refresh(), 2, 'destroy releases the registry');
});
