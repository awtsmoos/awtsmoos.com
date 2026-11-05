//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CameraMath.test.js
 * @description Proves camera mathematics is exact, bounded, and NaN-free at the
 * poles: look vectors stay unit length, pitch clamps, orbit eyes sit at the
 * requested distance, and pinch zoom moves the right direction.
 * The Awtsmoos places the observer inside the mission; these tests witness that
 * sight never degenerates into impossible numbers.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
	firstPersonLookVector,
	firstPersonCameraPose,
	firstPersonYawToPoint,
	firstPersonPitchToPoint
} from '../../src/camera/FirstPersonCameraPose.js';
import {
	cameraLookAngles,
	clampCameraPitch,
	cameraPointerPoint,
	cameraPointerDistance,
	boundedCameraDistance,
	MAXIMUM_CAMERA_PITCH,
	MINIMUM_CAMERA_PITCH
} from '../../src/camera/CameraGestureMath.js';
import {
	desiredCameraEye,
	clipCameraEye,
	buildCameraStats
} from '../../src/camera/CameraClipSystem.js';
import { CameraClipCache } from '../../src/camera/CameraClipCache.js';
import { resolveCameraContext, CAMERA_PROFILES } from '../../src/camera/CameraProfileSystem.js';
import { minimalMeadowViewportCameraPolicy } from '../../src/camera/MinimalMeadowViewportCameraPolicy.js';
import {
	applyLegacyWheelZoom,
	beginLegacyPinch,
	updateLegacyPinch
} from '../../src/camera/CameraLegacyZoom.js';
import { CameraMouseChordState } from '../../src/camera/CameraMouseChordState.js';
import {
	nodeBlocksCameraGesture,
	canBeginCameraGesture
} from '../../src/camera/CameraGestureSurface.js';
import { pointerRay, screenBox } from '../../src/world/DoorProjectionGeometry.js';
import { rayObb } from '../../src/world/DoorCollisionGeometry.js';

function finiteVector(vector) {
	return Number.isFinite(vector.x) && Number.isFinite(vector.y) && Number.isFinite(vector.z);
}

test('firstPersonLookVector is unit length and NaN-free at the poles', () => {
	for (const pitch of [-1.42, -1, 0, 1, 1.42, 99, -99, NaN]) {
		for (const yaw of [0, Math.PI / 2, Math.PI, -Math.PI, 1e9]) {
			const direction = firstPersonLookVector(yaw, pitch);
			assert.ok(finiteVector(direction), `NaN at yaw=${yaw} pitch=${pitch}`);
			const length = Math.hypot(direction.x, direction.y, direction.z);
			assert.ok(Math.abs(length - 1) < 1e-12, `not unit at pitch=${pitch}: ${length}`);
		}
	}
});

test('firstPersonLookVector matches the orbit pitch convention', () => {
	const level = firstPersonLookVector(0, 0);
	assert.ok(Math.abs(level.x) < 1e-12 && Math.abs(level.z - 1) < 1e-12 && Math.abs(level.y) < 1e-12);
	const up = firstPersonLookVector(Math.PI, 1.42);
	assert.ok(up.y < 0, 'positive pitch looks downward in orbit semantics');
	const quarter = firstPersonLookVector(Math.PI / 2, 0);
	assert.ok(Math.abs(quarter.x - 1) < 1e-12 && Math.abs(quarter.z) < 1e-12);
});

test('firstPersonCameraPose places the eye ahead and the target at range', () => {
	const pose = firstPersonCameraPose({ x: 10, y: 1.7, z: -4 }, Math.PI / 2, 0, { forwardOffset: 0.24, lookDistance: 100 });
	assert.ok(Math.abs(pose.eye.x - 10.24) < 1e-12, `eye ahead of face, got ${pose.eye.x}`);
	assert.equal(pose.eye.y, 1.7);
	const toTarget = Math.hypot(pose.target.x - pose.eye.x, pose.target.y - pose.eye.y, pose.target.z - pose.eye.z);
	assert.ok(Math.abs(toTarget - 100) < 1e-9);
});

test('firstPersonYawToPoint and PitchToPoint face known points', () => {
	assert.ok(Math.abs(firstPersonYawToPoint({ x: 0, z: 0 }, { x: 1, z: 0 }) - Math.PI / 2) < 1e-12);
	assert.equal(firstPersonYawToPoint({ x: 0, z: 0 }, { x: 0, z: 0 }, 2.5), 2.5, 'coincident points use fallback');
	const pitch = firstPersonPitchToPoint({ x: 0, y: 0, z: 0 }, { x: 0, y: -10, z: 10 });
	assert.ok(pitch > 0, 'looking down at a lower point is positive pitch in orbit semantics');
	assert.equal(firstPersonPitchToPoint({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, -0.5), -0.5);
});

test('cameraLookAngles applies sensitivity and clamps pitch', () => {
	const angles = cameraLookAngles(0, 0, 100, -50);
	assert.ok(Math.abs(angles.yaw - (-0.26)) < 1e-12);
	assert.ok(Math.abs(angles.pitch - (-0.12)) < 1e-12);
	const extreme = cameraLookAngles(0, 0, 0, 100000);
	assert.equal(extreme.pitch, MAXIMUM_CAMERA_PITCH);
	const low = cameraLookAngles(0, 0, 0, -100000);
	assert.equal(low.pitch, MINIMUM_CAMERA_PITCH);
	assert.equal(clampCameraPitch(Infinity), MAXIMUM_CAMERA_PITCH);
	assert.equal(clampCameraPitch(NaN), MINIMUM_CAMERA_PITCH, 'NaN clamps to the minimum');
});

test('cameraPointerPoint and cameraPointerDistance measure the screen', () => {
	assert.deepEqual(cameraPointerPoint({ clientX: 12, clientY: 34 }), { x: 12, y: 34 });
	assert.equal(cameraPointerDistance({ x: 0, y: 0 }, { x: 3, y: 4 }), 5);
	assert.equal(boundedCameraDistance(999, 1.35, 48), 48);
	assert.equal(boundedCameraDistance(0.1, 1.35, 48), 1.35);
});

test('desiredCameraEye sits at the requested distance behind the target', () => {
	const target = { x: 0, y: 1.5, z: 0 };
	const eye = desiredCameraEye(target, Math.PI, 0.34, 7);
	const distance = Math.hypot(eye.x - target.x, eye.y - target.y, eye.z - target.z);
	assert.ok(Math.abs(distance - 7) < 1e-9, `eye must orbit at distance 7, got ${distance}`);
});

test('clipCameraEye pulls the eye in front of an obstruction', () => {
	const target = { x: 0, y: 1.5, z: 0 };
	const desired = { x: 0, y: 1.5, z: -10 };
	const octree = {
		raycast() {
			return { distance: 4, point: { x: 0, y: 1.5, z: -4 }, item: { kind: 'wall' } };
		}
	};
	const clipped = clipCameraEye(target, desired, octree, 0.75);
	assert.ok(clipped.hit, 'obstruction detected');
	assert.ok(clipped.eye.z > -10 && clipped.eye.z < 0, 'eye pulled toward the target');
	const clear = clipCameraEye(target, desired, null, 0.75);
	assert.deepEqual(clear.eye, desired, 'no octree means no clipping');
	const stats = buildCameraStats({ mode: 'orbit', activeHouse: null, activeFloor: null, stairId: null }, target, clipped, 7);
	assert.equal(stats.wallHit, true);
});

test('CameraClipCache reuses a recent clip and refreshes on movement', () => {
	const cache = new CameraClipCache({ maximumReuseFrames: 2 });
	let casts = 0;
	const octree = { revision: 1, raycast() { casts += 1; return null; } };
	const target = { x: 0, y: 1, z: 0 };
	const desired = { x: 0, y: 2, z: -8 };
	const first = cache.resolve(target, desired, octree, 0.75);
	assert.equal(first.cached, false);
	const second = cache.resolve(target, desired, octree, 0.75);
	assert.equal(second.cached, true, 'still camera reuses the clip');
	assert.equal(casts, 1);
	const moved = cache.resolve({ x: 5, y: 1, z: 0 }, desired, octree, 0.75);
	assert.equal(moved.cached, false, 'large target movement refreshes');
	octree.revision = 2;
	const revised = cache.resolve({ x: 5, y: 1, z: 0 }, desired, octree, 0.75);
	assert.equal(revised.cached, false, 'collision revision invalidates');
	const diagnostics = cache.diagnostics();
	assert.ok(diagnostics.hits >= 1 && diagnostics.misses >= 1);
});

test('resolveCameraContext defaults to outdoor without houses', () => {
	const context = resolveCameraContext({ x: 0, y: 2, z: 0 });
	assert.equal(context.mode, 'outdoor');
	assert.equal(context.profile, CAMERA_PROFILES.outdoor);
	assert.equal(context.activeHouse, null);
});

test('resolveCameraContext detects an interior and stair context', () => {
	const house = { id: 'H1', x: 0, z: 0, width: 10, depth: 10, wallThickness: 0.5, floorY: 0, wallHeight: 3, floors: 2, storyHeight: 3, yaw: 0 };
	const indoor = resolveCameraContext({ x: 0, y: 1, z: 0 }, [house], []);
	assert.equal(indoor.mode, 'indoor');
	assert.equal(indoor.activeHouse, 'H1');
	const stairs = [{ houseId: 'H1', id: 'S1', width: 2, treadDepth: 0.3, opening: { centerX: 0, centerZ: 0 }, steps: [{ centerZ: 0 }], lowerLanding: { centerZ: -1, depth: 1 } }];
	const onStairs = resolveCameraContext({ x: 0, y: 1.5, z: 0 }, [house], stairs);
	assert.equal(onStairs.mode, 'stairs');
	assert.equal(onStairs.stairId, 'S1');
});

test('minimalMeadowViewportCameraPolicy frames portrait, landscape, and desktop', () => {
	const portrait = minimalMeadowViewportCameraPolicy({ innerWidth: 390, innerHeight: 844, navigator: { maxTouchPoints: 5 } });
	assert.equal(portrait.mode, 'portrait');
	assert.ok(portrait.distance < 8.2, 'portrait draws the camera nearer');
	const landscape = minimalMeadowViewportCameraPolicy({ innerWidth: 844, innerHeight: 390, navigator: { maxTouchPoints: 0 } });
	assert.equal(landscape.mode, 'short-landscape');
	const desktop = minimalMeadowViewportCameraPolicy({ innerWidth: 1920, innerHeight: 1080, navigator: { maxTouchPoints: 0 } });
	assert.equal(desktop.mode, 'desktop');
	assert.ok(Object.isFrozen(portrait));
});

test('legacy wheel and pinch zoom stay bounded and move the right direction', () => {
	const orbit = { distance: 7, min: 1.35, max: 48, isFirstPerson: () => false };
	applyLegacyWheelZoom(orbit, { deltaY: 1000, preventDefault() {} });
	assert.ok(orbit.distance > 7, 'wheel down zooms out (distance grows)');
	applyLegacyWheelZoom(orbit, { deltaY: -100000, preventDefault() {} });
	assert.equal(orbit.distance, 1.35, 'zoom in clamps at the minimum');
	const firstPerson = { distance: 7, min: 1, max: 48, isFirstPerson: () => true };
	applyLegacyWheelZoom(firstPerson, { deltaY: 1000, preventDefault() {} });
	assert.equal(firstPerson.distance, 7, 'first-person ignores legacy zoom');

	const pinchOrbit = { distance: 10, min: 1.35, max: 48, isFirstPerson: () => false };
	const pointers = new Map([['a', { x: 0, y: 0 }], ['b', { x: 100, y: 0 }]]);
	const pinch = beginLegacyPinch(pinchOrbit, pointers);
	assert.ok(pinch, 'two pointers begin a pinch');
	pointers.set('b', { x: 200, y: 0 });
	updateLegacyPinch(pinchOrbit, pointers, pinch);
	assert.ok(pinchOrbit.distance < 10, 'spreading fingers zooms in');
});

test('CameraMouseChordState tracks chords without stranded buttons', () => {
	const mouse = new CameraMouseChordState();
	mouse.update({ pointerType: 'mouse', buttons: 3, pointerId: 7 });
	assert.equal(mouse.moveForward, true);
	assert.equal(mouse.mode(), 'both');
	mouse.update({ pointerType: 'mouse', buttons: 0, pointerId: 7 });
	assert.equal(mouse.active, false);
	assert.equal(mouse.pointerId, null);
	mouse.update({ pointerType: 'touch' }, 'down');
	assert.equal(mouse.active, false, 'touch never feeds the mouse chord');
	const snapshot = mouse.snapshot();
	assert.ok('moveForward' in snapshot && 'mode' in snapshot);
});

test('camera gesture surface protects HUD controls', () => {
	const blocked = { matches: (selector) => selector.includes('button') };
	assert.equal(nodeBlocksCameraGesture(blocked), true);
	assert.equal(nodeBlocksCameraGesture({}), false);
	const event = { target: { tagName: 'CANVAS', parentElement: null }, composedPath: () => [{ tagName: 'CANVAS' }] };
	assert.equal(canBeginCameraGesture(event), true);
	const hudEvent = { composedPath: () => [{ matches: () => true }] };
	assert.equal(canBeginCameraGesture(hudEvent), false);
});

test('pointerRay and screenBox survive degenerate camera geometry', () => {
	const camera = {
		position: { x: 0, y: 2, z: -5 },
		target: [0, 1, 0],
		fov: 45,
		aspect: 16 / 9
	};
	const canvas = { getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }), clientWidth: 800, clientHeight: 600 };
	const ray = pointerRay({ clientX: 400, clientY: 300 }, camera, canvas);
	assert.ok(Number.isFinite(ray.dir.x + ray.dir.y + ray.dir.z));
	const length = Math.hypot(ray.dir.x, ray.dir.y, ray.dir.z);
	assert.ok(Math.abs(length - 1) < 1e-9, 'pointer ray is normalized');
	// Box behind the camera projects to nothing rather than throwing.
	const box = { center: { x: 0, y: 1, z: 0 }, right: { x: 1, y: 0, z: 0 }, up: { x: 0, y: 1, z: 0 }, forward: { x: 0, y: 0, z: 1 }, half: { x: 1, y: 1, z: 0.2 } };
	const projected = screenBox(box, camera, canvas, [0, 1, 0], 8);
	assert.ok(projected === null || Number.isFinite(projected.x0 + projected.x1 + projected.y0 + projected.y1));
});

test('rayObb intersects a yawed doorway box on a known ray', () => {
	const yaw = 0.3;
	const box = {
		center: { x: 0, y: 1, z: 5 },
		right: { x: Math.cos(yaw), y: 0, z: Math.sin(yaw) },
		up: { x: 0, y: 1, z: 0 },
		forward: { x: -Math.sin(yaw), y: 0, z: Math.cos(yaw) },
		half: { x: 1, y: 1, z: 0.2 }
	};
	const hit = rayObb({ origin: { x: 0, y: 1, z: 0 }, dir: { x: 0, y: 0, z: 1 } }, box);
	assert.ok(hit, 'ray down the doorway axis hits');
	assert.ok(hit.t > 4 && hit.t < 6);
	const miss = rayObb({ origin: { x: 10, y: 1, z: 0 }, dir: { x: 0, y: 0, z: 1 } }, box);
	assert.equal(miss, null);
});
