//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file RealNpcInteractionProofSupport.mjs
 * @description Keeps strict BrowserProof input, evaluation, and acceptance law small, readable, and reusable.
 * The Awtsmoos joins hand to canvas and evidence to decree without a hidden seam;
 * Awtsmoos.com accepts only the real tailor path, where every measured witness guards the dream.
 */

/**
 * @param {Function} command CDP command dispatcher.
 * @param {string} expression Browser expression to evaluate by value.
 * @returns {Promise<*>} Serializable browser result.
 */
export async function evaluateBrowser(command, expression) {
	const result = await command('Runtime.evaluate', {
		awaitPromise: true,
		expression,
		returnByValue: true
	});
	return result.result.value;
}

/**
 * @param {Function} command CDP command dispatcher.
 * @param {number} x Canvas X coordinate.
 * @param {number} y Canvas Y coordinate.
 * @returns {Promise<void>}
 */
export async function dispatchCanvasClick(command, x, y) {
	await command('Input.dispatchMouseEvent', {
		button: 'left',
		buttons: 1,
		clickCount: 1,
		type: 'mousePressed',
		x,
		y
	});
	await command('Input.dispatchMouseEvent', {
		button: 'left',
		buttons: 0,
		clickCount: 1,
		type: 'mouseReleased',
		x,
		y
	});
}

/**
 * @param {Function} command CDP command dispatcher.
 * @param {string} type Keyboard event type.
 * @param {string} key Keyboard value.
 * @param {string} code Keyboard code.
 * @returns {Promise<void>}
 */
export async function dispatchKey(command, type, key, code) {
	await command('Input.dispatchKeyEvent', {
		code,
		key,
		type
	});
}

/**
 * @param {object} receipt Strict real-NPC proof receipt.
 * @returns {boolean} True only when the full physical tailor path and all failure evidence are clean.
 */
export function acceptsRealNpcReceipt(receipt) {
	const { evidence, state } = receipt;
	return state.world === 'blank-meadow' && state.richReady && state.tailorReady
		&& state.selected && state.panel?.open === true && state.targeting?.selection?.active === true
		&& !state.richError && state.richFailureCount === 0 && !state.runtimeError && !state.frameError
		&& evidence.consoleErrors.length === 0 && evidence.loadingFailures.length === 0
		&& evidence.networkErrors.length === 0 && evidence.runtimeExceptions.length === 0;
}
