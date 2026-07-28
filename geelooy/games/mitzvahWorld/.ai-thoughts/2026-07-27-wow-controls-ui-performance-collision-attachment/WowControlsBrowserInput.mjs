// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WowControlsBrowserInput.mjs
 * @description Drives Chrome's real mouse and keyboard domains and records live runtime effects.
 * The Awtsmoos joins physical gesture to finite consequence; Awtsmoos.com measures left sight,
 * right-facing, two-button travel, A/D strafe, and blur release through the actual canvas listeners.
 */

import {
	inputStrafe,
	runtimeSnapshot
} from './WowControlsBrowserRuntime.mjs';

export async function prepareWowBrowser(client) {
	await client.send('Runtime.enable');
	await client.send('Page.enable');
	await client.send('Network.enable');
	await client.send('Network.setCacheDisabled', { cacheDisabled: true });
	await client.send('Emulation.setDeviceMetricsOverride', {
		deviceScaleFactor: 1,
		height: 720,
		mobile: false,
		width: 1280
	});
}

export async function exerciseWowMouse(client) {
	return {
		left: await dragReceipt(client, 'left', 1),
		right: await dragReceipt(client, 'right', 2),
		both: await bothButtonMovement(client)
	};
}

export async function exerciseWowKeyboard(client) {
	await key(client, 'keyDown', 'KeyA', 'a');
	const aDown = await inputStrafe(client);
	await key(client, 'keyUp', 'KeyA', 'a');
	const aUp = await inputStrafe(client);
	await key(client, 'keyDown', 'KeyD', 'd');
	const dDown = await inputStrafe(client);
	await client.send('Runtime.evaluate', {
		expression: "window.dispatchEvent(new Event('blur'))"
	});
	const afterBlur = await inputStrafe(client);
	await key(client, 'keyUp', 'KeyD', 'd');
	return { aDown, aUp, afterBlur, dDown };
}

async function dragReceipt(client, button, buttons) {
	const before = await runtimeSnapshot(client);
	await mouse(client, 'mousePressed', 600, 340, button, buttons);
	await mouse(client, 'mouseMoved', 740, 390, button, buttons);
	await delay(180);
	const after = await runtimeSnapshot(client);
	await mouse(client, 'mouseReleased', 740, 390, button, 0);
	return {
		alignment: angleDistance(after.facing, after.yaw),
		facingDelta: angleDistance(after.facing, before.facing),
		yawDelta: angleDistance(after.yaw, before.yaw)
	};
}

async function bothButtonMovement(client) {
	const before = await runtimeSnapshot(client);
	await mouse(client, 'mousePressed', 640, 360, 'left', 1);
	await mouse(client, 'mousePressed', 640, 360, 'right', 3);
	await delay(650);
	const after = await runtimeSnapshot(client);
	await mouse(client, 'mouseReleased', 640, 360, 'right', 1);
	await mouse(client, 'mouseReleased', 640, 360, 'left', 0);
	return {
		distance: Math.hypot(after.x - before.x, after.z - before.z)
	};
}

function mouse(client, type, x, y, button, buttons) {
	return client.send('Input.dispatchMouseEvent', {
		button,
		buttons,
		clickCount: type === 'mousePressed' ? 1 : 0,
		type,
		x,
		y
	});
}

function key(client, type, code, keyValue) {
	return client.send('Input.dispatchKeyEvent', {
		code,
		key: keyValue,
		type,
		windowsVirtualKeyCode: keyValue.toUpperCase().charCodeAt(0)
	});
}

function angleDistance(first, second) {
	return Math.abs(Math.atan2(
		Math.sin(first - second),
		Math.cos(first - second)
	));
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
