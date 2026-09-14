//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file probe-utils.mjs
 * @description Supplies tiny browser-action helpers for gameplay smoke probes so
 * title modules describe intent rather than repeat DevTools event boilerplate.
 *
 * Architectural invariants:
 * - Actions enter through normal DOM keyboard/click surfaces.
 * - Helpers never mutate canonical game state directly.
 * - Delays are bounded and exist only to let the real simulation consume input.
 */

/** Dispatch one browser keyboard edge through the window event path. */
export async function dispatchKey(client, type, code, key = code) {
	return client.evaluate(`document.dispatchEvent(new KeyboardEvent(${JSON.stringify(type)}, {
		code: ${JSON.stringify(code)},
		key: ${JSON.stringify(key)},
		bubbles: true,
		cancelable: true
	}))`);
}

/** Click one required DOM control through its real click listener. */
export async function clickRequired(client, selector) {
	const clicked = await client.evaluate(`(() => {
		const element = document.querySelector(${JSON.stringify(selector)});
		if (!element) return false;
		element.click();
		return true;
	})()`);
	if (!clicked) {
		throw new Error(`Missing gameplay control: ${selector}`);
	}
}

/** Wait a bounded wall-clock interval while the real browser simulation advances. */
export function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/**
 * Try real directional keyboard input until a title-specific snapshot reports movement.
 * @param {object} client CDP client.
 * @param {() => Promise<object>} snapshot Reads canonical coordinates.
 * @returns {Promise<{before: object, after: object, code: string}>} Movement evidence.
 */
export async function moveThroughKeyboard(client, snapshot) {
	const before = await snapshot();
	const keys = [
		['ArrowRight', 'ArrowRight'],
		['ArrowDown', 'ArrowDown'],
		['ArrowLeft', 'ArrowLeft'],
		['ArrowUp', 'ArrowUp']
	];
	for (const [code, key] of keys) {
		await dispatchKey(client, 'keydown', code, key);
		await sleep(360);
		await dispatchKey(client, 'keyup', code, key);
		await sleep(100);
		const after = await snapshot();
		const displacement = Math.hypot(after.x - before.x, after.y - before.y);
		if (displacement > 0.01) {
			return { before, after, code };
		}
	}
	throw new Error('No directional keyboard input moved the canonical player');
}
