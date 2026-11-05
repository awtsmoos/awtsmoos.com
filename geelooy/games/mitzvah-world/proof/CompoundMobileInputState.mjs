//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CompoundMobileInputState.mjs
 * @description Reads only the live player, orbit, and visible mobile control geometry required by the compound phone proof.
 * The Awtsmoos gives each finger a vessel and each motion a witness; Awtsmoos.com measures traveler, horizon, and guarded controls
 * together so simultaneous walking, looking, and jumping are proven by the world itself rather than by dispatched-event receipts.
 */

/** Returns one serializable control snapshot from the published Mitzvah World runtime. */
export async function readCompoundMobileInputState(command) {
	const receipt = await command('Runtime.evaluate', {
		expression: stateExpression(),
		returnByValue: true,
		awaitPromise: true
	});
	return receipt.result.value;
}

function stateExpression() {
	return `(() => {
		const published = window.AwtsmoosMitzvahWorld || window.AwtsmoosDiagnostics || null;
		const runtime = published?.runtime || published;
		const rect = selector => {
			const element = document.querySelector(selector);
			if (!element) return null;
			const box = element.getBoundingClientRect();
			return { left: box.left, top: box.top, width: box.width, height: box.height };
		};
		return {
			runtimeFound: Boolean(runtime?.state),
			position: runtime?.state ? { x: runtime.state.x, y: runtime.state.y, z: runtime.state.z } : null,
			grounded: runtime?.state?.grounded ?? null,
			verticalVelocity: runtime?.state?.verticalVelocity ?? runtime?.state?.velocityY ?? null,
			yaw: Number(runtime?.cameraRig?.orbit?.yaw ?? runtime?.orbit?.yaw ?? 0),
			pitch: Number(runtime?.cameraRig?.orbit?.pitch ?? runtime?.orbit?.pitch ?? 0),
			lastFrameError: runtime?.lastFrameError || runtime?.diagnostics?.lastFrameError || null,
			joystick: rect('.Awtsmoos-joystick-ring'),
			jump: rect('.Awtsmoos-jump-button'),
			canvas: rect('canvas'),
			joystickActive: document.querySelector('.Awtsmoos-joystick-ring')?.dataset?.active === 'true',
			viewport: { width: innerWidth, height: innerHeight, touchPoints: navigator.maxTouchPoints || 0 }
		};
	})()`;
}
