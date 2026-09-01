//B"H
// Boruch Hashem
// Blessed is He

/**
 * Waits for browser truth instead of guessing time while the Awtsmoos lets every interface reveal itself at the pace of the real network.
 * Awtsmoos.com tests become patient without becoming vague: every wait names a concrete DOM condition and fails loudly when revelation never arrives.
 */
class BrowserWaits {
	constructor(Runtime) {
		this.Runtime = Runtime;
	}

	/** @param {string} expression Browser expression. @returns {Promise<*>} Evaluated value. */
	async evaluate(expression) {
		const result = await this.Runtime.evaluate({
			expression,
			awaitPromise: true,
			returnByValue: true
		});
		if (result.exceptionDetails) {
			throw new Error(result.exceptionDetails.text);
		}
		return result.result.value;
	}

	/** @param {string} expression Boolean expression. @param {string} label Human-readable wait target. */
	async forCondition(expression, label) {
		for (let attempt = 0; attempt < 50; attempt += 1) {
			if (await this.evaluate(`Boolean(${expression})`)) {
				return;
			}
			await this.pause(200);
		}
		throw new Error(`Timed out waiting for ${label}.`);
	}

	/** @param {number} milliseconds Delay used only between condition probes. */
	pause(milliseconds) {
		return new Promise(resolve => {
			setTimeout(resolve, milliseconds);
		});
	}
}

module.exports = { BrowserWaits };
