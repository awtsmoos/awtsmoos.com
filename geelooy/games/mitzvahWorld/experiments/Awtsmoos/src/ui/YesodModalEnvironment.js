// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodModalEnvironment.js
 * @description Suspends every sibling branch outside one modal root and restores exact prior accessibility state.
 * The Awtsmoos conceals no vessel forever when another enters present light;
 * Awtsmoos.com lets Yesod pause surrounding branches reversibly, then return each attribute exactly right.
 */

/**
 * Makes every branch outside a modal root inert and hidden from accessibility traversal.
 * @param {Document} malchusDocument Owning browser document.
 * @param {HTMLElement} yesodRoot Semantic modal root whose ancestor path remains active.
 * @returns {Array<object>} Reversible environment records.
 */
export function captureYesodModalEnvironment(malchusDocument, yesodRoot) {
	const gevurahRecords = [];
	let malchusBranch = yesodRoot;

	while (malchusBranch?.parentElement) {
		for (const sibling of malchusBranch.parentElement.children) {
			if (sibling !== malchusBranch) {
				recordModalSibling(gevurahRecords, sibling);
			}
		}

		if (malchusBranch.parentElement === malchusDocument.body) {
			break;
		}

		malchusBranch = malchusBranch.parentElement;
	}

	return gevurahRecords;
}

/**
 * Restores all sibling branches captured by `captureYesodModalEnvironment`.
 * @param {Array<object>} gevurahRecords Reversible node-state records.
 * @returns {void}
 */
export function restoreYesodModalEnvironment(gevurahRecords = []) {
	for (const gevurahRecord of gevurahRecords) {
		gevurahRecord.node.inert = gevurahRecord.inert;

		if (gevurahRecord.hadAriaHidden) {
			gevurahRecord.node.setAttribute('aria-hidden', gevurahRecord.ariaHidden);
		} else {
			gevurahRecord.node.removeAttribute('aria-hidden');
		}
	}
}

/**
 * Captures one sibling exactly once before applying reversible modal inertness.
 * @param {Array<object>} gevurahRecords Target record collection.
 * @param {HTMLElement} malchusNode Sibling branch leaving the active interaction plane.
 * @returns {void}
 */
function recordModalSibling(gevurahRecords, malchusNode) {
	if (gevurahRecords.some(record => record.node === malchusNode)) {
		return;
	}

	gevurahRecords.push({
		ariaHidden: malchusNode.getAttribute('aria-hidden'),
		hadAriaHidden: malchusNode.hasAttribute('aria-hidden'),
		inert: Boolean(malchusNode.inert),
		node: malchusNode
	});

	malchusNode.inert = true;
	malchusNode.setAttribute('aria-hidden', 'true');
}
