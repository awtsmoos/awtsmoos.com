//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file RealGameplaySmokeCdp.mjs
 * @description Carries the small Chrome DevTools mechanics shared by MitzvahWorld smoke proofs.
 * The Awtsmoos gives protocol movement a bounded vessel; Awtsmoos.com keeps the release proof
 * focused on gameplay meaning while this module owns only evaluation, waiting, domains, and keys.
 */

/** Enables every browser domain needed by the release evidence ledger. */
export async function enableProofDomains(command) {
	for (const domain of ['Page', 'Runtime', 'Network', 'Log']) {
		await command(`${domain}.enable`);
	}
}

/** Evaluates one detached expression in the active production page. */
export async function evaluate(command, expression) {
	const result = await command('Runtime.evaluate', {
		awaitPromise: true,
		expression,
		returnByValue: true
	});
	return result.result.value;
}

/** Sends one genuine held keyboard input through Chrome's physical-style input pipeline. */
export async function pressKey(command, key, code, keyCode, milliseconds) {
	await command('Input.dispatchKeyEvent', {
		code,
		key,
		nativeVirtualKeyCode: keyCode,
		type: 'keyDown',
		windowsVirtualKeyCode: keyCode
	});
	await delay(milliseconds);
	await command('Input.dispatchKeyEvent', {
		code,
		key,
		nativeVirtualKeyCode: keyCode,
		type: 'keyUp',
		windowsVirtualKeyCode: keyCode
	});
}

/** Resolves after one bounded wall-clock delay used only for browser polling/input holds. */
export function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
