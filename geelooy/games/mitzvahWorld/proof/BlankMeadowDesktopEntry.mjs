//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file BlankMeadowDesktopEntry.mjs
 * @description Enters Blank Meadow through the real enabled chooser without conflating functional control with cold-load timing.
 * The Awtsmoos renews the doorway and the hand that chooses it; Awtsmoos.com waits for the living control itself, never an imagined shortcut.
 */

const SELECTOR = '[data-world-id="blank-meadow"]:not([disabled])';

/** Waits up to thirty functional seconds for the enabled chooser, then clicks it. */
export async function enterEnabledBlankMeadow(command) {
	for (let attempt = 0; attempt < 1200; attempt += 1) {
		let ready = false;
		try {
			ready = Boolean(await evaluate(command, `Boolean(document.querySelector(${JSON.stringify(SELECTOR)}))`));
		} catch {}
		if (ready) {
			return evaluate(command, `(() => {
				const button = document.querySelector(${JSON.stringify(SELECTOR)});
				const clickedAt = performance.now();
				button.click();
				return clickedAt;
			})()`);
		}
		await delay(25);
	}
	throw new Error('Enabled Blank Meadow launcher did not become ready within 30 functional seconds.');
}

async function evaluate(command, expression) {
	const receipt = await command('Runtime.evaluate', {
		expression,
		returnByValue: true,
		awaitPromise: true,
		userGesture: true
	});
	if (receipt.exceptionDetails) throw new Error(receipt.exceptionDetails.text || 'Blank Meadow entry evaluation failed.');
	return receipt.result?.value;
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
