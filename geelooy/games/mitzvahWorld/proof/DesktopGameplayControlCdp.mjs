//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DesktopGameplayControlCdp.mjs
 * @description Drives desktop movement, jumping, and camera gestures only through Chrome input events.
 * The Awtsmoos renews hand and foot through lawful browser vessels; Awtsmoos.com measures the living
 * traveler, so no direct runtime mutation can masquerade as keyboard or mouse control.
 */

import { snapshotExpression } from '../experiments/Awtsmoos/src/test/browser/RealGameplaySnapshotExpression.mjs';

export async function readDesktopSnapshot(command) {
	return evaluate(command, snapshotExpression());
}

export async function holdDesktopKey(command, code, key, durationMs) {
	await dispatchKey(command, 'keyDown', code, key);
	await delay(durationMs);
	await dispatchKey(command, 'keyUp', code, key);
	await delay(140);
	return readDesktopSnapshot(command);
}

export async function proveDesktopJump(command) {
	const before = await readDesktopSnapshot(command);
	await dispatchKey(command, 'keyDown', 'Space', ' ');
	await delay(80);
	await dispatchKey(command, 'keyUp', 'Space', ' ');
	let peak = before;
	for (let sample = 0; sample < 32; sample += 1) {
		await delay(40);
		const current = await readDesktopSnapshot(command);
		if (current.player.y > peak.player.y) peak = current;
	}
	return { after: await readDesktopSnapshot(command), before, peak };
}

export async function proveDesktopCameraDrag(command) {
	await delay(420);
	const baselineStart = await readDesktopSnapshot(command);
	await delay(300);
	const baselineEnd = await readDesktopSnapshot(command);
	const geometry = await canvasGeometry(command);
	if (!geometry) throw new Error('DESKTOP_PROOF_CANVAS_GEOMETRY_MISSING');
	await command('Input.dispatchMouseEvent', {
		button: 'right', buttons: 2, clickCount: 1, type: 'mousePressed',
		x: geometry.x, y: geometry.y
	});
	for (let step = 1; step <= 5; step += 1) {
		await command('Input.dispatchMouseEvent', {
			button: 'none', buttons: 2, type: 'mouseMoved',
			x: geometry.x + step * 22, y: geometry.y + step * 3
		});
		await delay(35);
	}
	await command('Input.dispatchMouseEvent', {
		button: 'right', buttons: 0, clickCount: 1, type: 'mouseReleased',
		x: geometry.x + 110, y: geometry.y + 15
	});
	await delay(220);
	return { after: await readDesktopSnapshot(command), baselineEnd, baselineStart, geometry };
}

export function planarDistance(first, second) {
	return Math.hypot(
		Number(second?.x || 0) - Number(first?.x || 0),
		Number(second?.z || 0) - Number(first?.z || 0)
	);
}

export function vectorDistance(first, second) {
	return Math.hypot(
		Number(second?.x || 0) - Number(first?.x || 0),
		Number(second?.y || 0) - Number(first?.y || 0),
		Number(second?.z || 0) - Number(first?.z || 0)
	);
}

export function facingDistance(first, second) {
	const raw = Math.abs(Number(second || 0) - Number(first || 0)) % (Math.PI * 2);
	return Math.min(raw, Math.PI * 2 - raw);
}

async function canvasGeometry(command) {
	return evaluate(command, `(() => {
		const rect = document.querySelector('#AwtsmoosCanvas')?.getBoundingClientRect?.();
		if (!rect?.width || !rect?.height) return null;
		return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
	})()`);
}

function dispatchKey(command, type, code, key) {
	return command('Input.dispatchKeyEvent', { code, key, type });
}

async function evaluate(command, expression) {
	const receipt = await command('Runtime.evaluate', {
		awaitPromise: true, expression, returnByValue: true
	});
	return receipt.result.value;
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
