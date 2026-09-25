//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CompoundMobileInputCdp.mjs
 * @description Drives independent production joystick, world-camera, and JUMP touches through real Chrome touch events.
 * The Awtsmoos gives each finger its own shlichus; Awtsmoos.com keeps walking, sight, and ascent independent,
 * then cancels every touch and proves the same vessels can receive fresh life instead of preserving stale ownership.
 */

import { readCompoundMobileInputState } from './CompoundMobileInputState.mjs';

/** Runs one compound gesture and one post-cancel recovery move, returning only physical/runtime evidence. */
export async function runCompoundMobileGesture(command) {
	const before = await readCompoundMobileInputState(command);
	if (!before.joystick || !before.jump || !before.canvas) throw new Error('Visible mobile controls were not mounted.');
	const movement = point(centerX(before.joystick), centerY(before.joystick), 1);
	const world = point(before.canvas.left + before.canvas.width * 0.76, before.canvas.top + before.canvas.height * 0.38, 2);
	const jump = point(centerX(before.jump), centerY(before.jump), 3);
	await touch(command, 'touchStart', [movement]);
	movement.y -= Math.min(58, before.joystick.height * 0.7);
	await touch(command, 'touchMove', [movement]);
	await delay(180);
	await touch(command, 'touchStart', [movement, world]);
	const cameraStart = await readCompoundMobileInputState(command);
	world.x -= Math.min(90, before.canvas.width * 0.22);
	await touch(command, 'touchMove', [movement, world]);
	await delay(140);
	await touch(command, 'touchStart', [movement, world, jump]);
	const jumpPeak = await sampleJumpPeak(command, before.position.y);
	const combined = await readCompoundMobileInputState(command);
	await touch(command, 'touchCancel', []);
	await delay(260);
	const cancelled = await readCompoundMobileInputState(command);
	const recovery = await recoveryMove(command, cancelled.joystick);
	return {
		before,
		cameraStart,
		combined,
		cancelled,
		jumpPeak,
		recovery,
		movement: planarDistance(before.position, combined.position),
		yawDelta: Math.abs(combined.yaw - cameraStart.yaw),
		jumpRise: jumpPeak - before.position.y
	};
}

async function recoveryMove(command, ring) {
	const before = await readCompoundMobileInputState(command);
	const touchPoint = point(centerX(ring), centerY(ring), 7);
	await touch(command, 'touchStart', [touchPoint]);
	touchPoint.y -= Math.min(54, ring.height * 0.68);
	await touch(command, 'touchMove', [touchPoint]);
	await delay(460);
	await touch(command, 'touchEnd', []);
	await delay(120);
	const after = await readCompoundMobileInputState(command);
	return { before: before.position, after: after.position, movement: planarDistance(before.position, after.position) };
}

async function sampleJumpPeak(command, baseline) {
	let peak = baseline;
	for (let sample = 0; sample < 12; sample += 1) {
		await delay(40);
		peak = Math.max(peak, Number((await readCompoundMobileInputState(command)).position?.y || baseline));
	}
	return peak;
}

async function touch(command, type, touchPoints) {
	await command('Input.dispatchTouchEvent', { type, touchPoints });
}

function point(x, y, id) { return { force: 1, id, radiusX: 5, radiusY: 5, x, y }; }
function centerX(rect) { return rect.left + rect.width / 2; }
function centerY(rect) { return rect.top + rect.height / 2; }
function planarDistance(a, b) { return a && b ? Math.hypot(b.x - a.x, b.z - a.z) : 0; }
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
