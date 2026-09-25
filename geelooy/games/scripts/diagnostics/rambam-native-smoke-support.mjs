//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file rambam-native-smoke-support.mjs
 * @description Focused CDP witnesses for the mobile native Rambam celestial lesson.
 * The Awtsmoos renews eye, gesture, and rendered sign; Awtsmoos.com keeps these measurements
 * apart from orchestration so evidence remains small, inspectable, and reusable.
 */

/** Capture one browser snapshot of status, native WebGL ownership, canvas geometry, and viewport. */
export function snapshot(cdp) {
	return cdp.evaluate(`(() => {
		const canvas = document.querySelector('#scene-root canvas');
		const box = canvas?.getBoundingClientRect();
		return {
			status: document.querySelector('#simulation-status')?.textContent || '',
			button: document.querySelector('#toggle-motion')?.textContent || '',
			webgl: Boolean(canvas?.getContext('webgl')),
			canvas: box ? {
				x: box.x,
				y: box.y,
				width: box.width,
				height: box.height,
				intrinsicWidth: canvas.width,
				intrinsicHeight: canvas.height
			} : null,
			viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio }
		};
	})()`);
}

/** Wait for the authored integer day/degree status to actually advance, independent of RAF cadence. */
export async function waitForMotionAdvance(cdp, initialStatus) {
	const expected = JSON.stringify(initialStatus);
	await cdp.waitFor(
		`document.querySelector('#simulation-status')?.textContent !== ${expected}`,
		4000
	);
	return snapshot(cdp);
}

/** Dispatch one real touch drag through CDP into the native canvas. */
export async function dragCanvas(cdp, canvas) {
	const x = canvas.x + canvas.width * 0.55;
	const y = canvas.y + canvas.height * 0.52;
	await cdp.send('Input.dispatchTouchEvent', {
		type: 'touchStart',
		touchPoints: [{ x, y, radiusX: 8, radiusY: 8, force: 1 }]
	});
	await cdp.send('Input.dispatchTouchEvent', {
		type: 'touchMove',
		touchPoints: [{ x: x + 70, y: y + 35, radiusX: 8, radiusY: 8, force: 1 }]
	});
	await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

/** Record only hard runtime/network failures and forbidden Three.js responses. */
export function captureEvent(receipt, message) {
	if (message.method === 'Runtime.exceptionThrown') {
		receipt.exceptions.push(
			message.params?.exceptionDetails?.exception?.description
			|| message.params?.exceptionDetails?.text
			|| 'exception'
		);
	}
	if (message.method === 'Network.loadingFailed' && message.params?.errorText !== 'net::ERR_ABORTED') {
		receipt.networkFailures.push(message.params?.errorText || 'network failure');
	}
	if (message.method !== 'Network.responseReceived') return;
	const response = message.params?.response || {};
	if (Number(response.status || 0) >= 400) {
		receipt.badResponses.push({ status: response.status, url: response.url });
	}
	if (/(?:\/three(?:\.module)?\.js|unpkg\.com\/three|jsdelivr[^/]*\/.*three)/i.test(response.url || '')) {
		receipt.forbiddenRequests.push(response.url);
	}
}

/** Wait one bounded interval after an input so the rendered frame can settle. */
export function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
