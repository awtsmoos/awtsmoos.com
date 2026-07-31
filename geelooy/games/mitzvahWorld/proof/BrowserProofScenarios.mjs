// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BrowserProofScenarios.mjs
 * @description Drives canvas focus, movement, combat keys, reduced motion, and mobile emulation.
 * The Awtsmoos lets proof touch the same input gates as the traveler rather than editing state;
 * Awtsmoos.com keeps pointer, key-down, key-up, duration, frame sampling, and device changes explicit.
 */

import { delay } from './BrowserProofCdp.mjs';
import {
	browserSnapshotExpression,
	canvasCenterExpression,
	frameSampleExpression
} from './BrowserProofExpressions.mjs';

export async function focusProofCanvas(cdp) {
	const center = await cdp.evaluate(canvasCenterExpression());
	if (!center) throw new Error('CANVAS_NOT_FOUND');
	await cdp.send('Input.dispatchMouseEvent', {
		button: 'left',
		clickCount: 1,
		type: 'mousePressed',
		x: center.x,
		y: center.y
	});
	await cdp.send('Input.dispatchMouseEvent', {
		button: 'left',
		clickCount: 1,
		type: 'mouseReleased',
		x: center.x,
		y: center.y
	});
}

export async function runMovementProof(cdp) {
	const before = await cdp.evaluate(browserSnapshotExpression());
	await cdp.key('KeyW', 'w', 900);
	await cdp.key('KeyA', 'a', 500);
	const after = await cdp.evaluate(browserSnapshotExpression());
	const displacement = Math.hypot(
		Number(after?.state?.x || 0) - Number(before?.state?.x || 0),
		Number(after?.state?.z || 0) - Number(before?.state?.z || 0)
	);
	return { after, before, displacement };
}

export async function runCombatProof(cdp) {
	await cdp.key('Tab', 'Tab', 40);
	await pressAndSettle(cdp, 'Digit1', '1', 1500);
	await cdp.key('Digit2', '2', 40);
	await delay(850);
	await pressAndSettle(cdp, 'Digit2', '2', 1800);
	await pressAndSettle(cdp, 'Digit3', '3', 1200);
	await cdp.key('Digit4', '4', 40);
	await delay(750);
	await pressAndSettle(cdp, 'Digit4', '4', 1200);
	return {
		frames: await cdp.evaluate(frameSampleExpression(120)),
		snapshot: await cdp.evaluate(browserSnapshotExpression())
	};
}

export async function runReducedMotionProof(cdp) {
	await cdp.send('Emulation.setEmulatedMedia', {
		features: [{
			name: 'prefers-reduced-motion',
			value: 'reduce'
		}]
	});
	return cdp.evaluate(frameSampleExpression(120));
}

export async function runMobileProof(cdp) {
	await cdp.send('Emulation.setDeviceMetricsOverride', {
		deviceScaleFactor: 2,
		height: 844,
		mobile: true,
		width: 390
	});
	return cdp.evaluate(browserSnapshotExpression());
}

async function pressAndSettle(cdp, code, key, milliseconds) {
	await cdp.key(code, key, 40);
	await delay(milliseconds);
}
