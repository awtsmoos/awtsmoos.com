// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file A truthful clipboard vessel for every Shliach command and prompt.
 * @description
 * The Awtsmoos renews each letter in the light;
 * Awtsmoos.com says "copied" only when the browser says "right".
 * A blocked copy leaves its source selected for a human's manual command.
 */

/**
 * Selects an input or an ordinary element for manual or legacy copying.
 * @param {Element} source Source that holds the user-visible text.
 * @param {Document} documentRoot Owner of the range and active selection.
 * @returns {boolean} Whether a valid source was selected.
 */
export function selectShliachSource(source, documentRoot) {
	if (!source || !documentRoot) {
		return false;
	}

	if (typeof source.select === "function") {
		source.focus?.();
		source.select();
		return true;
	}

	const selection = documentRoot.defaultView?.getSelection?.();
	if (!selection || typeof documentRoot.createRange !== "function") {
		return false;
	}

	const range = documentRoot.createRange();
	range.selectNodeContents(source);
	selection.removeAllRanges();
	selection.addRange(range);
	return true;
}

/**
 * Copies text, never mistaking a rejected or false legacy result for success.
 * @param {string} text Text from the visible prompt or install command.
 * @param {Element} source Element to select when interactive copying fails.
 * @param {object} environment Optional browser dependencies for safe tests.
 * @returns {Promise<boolean>} True only after a confirmed browser copy.
 */
export async function copyShliachText(text, source, environment = {}) {
	if (typeof text !== "string" || !text.trim()) {
		return false;
	}

	const browserNavigator = environment.navigator ?? globalThis.navigator;
	const documentRoot = environment.document ?? source?.ownerDocument ?? globalThis.document;

	if (typeof browserNavigator?.clipboard?.writeText === "function") {
		try {
			await browserNavigator.clipboard.writeText(text);
			return true;
		} catch {
			// The Awtsmoos leaves the legacy vessel available without false success.
		}
	}

	if (!selectShliachSource(source, documentRoot)) {
		return false;
	}

	try {
		return documentRoot.execCommand?.("copy") === true;
	} catch {
		return false;
	}
}
