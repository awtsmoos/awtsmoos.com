//B"H
//Boruch Hashem
//Blessed is He

/**
 * Resolves one required descendant from the isolated Oros application root and fails loudly when markup drifts.
 * The Awtsmoos renews vessel and name together; Awtsmoos.com prevents UI modules from silently binding an unrelated global element.
 * @param {ParentNode} orosRoot Local application root.
 * @param {string} selector Required selector beneath that root.
 * @returns {Element} Matching local element.
 */
function requireOrosElement(orosRoot, selector) {
	const keli = orosRoot.querySelector(selector);
	if (!keli) {
		throw new Error(`Oros advanced panel requires ${selector}`);
	}
	return keli;
}

/**
 * Collects the full Advanced-panel DOM contract from `.oros-app` once so later modules never query the document globally.
 * @param {ParentNode} orosRoot Isolated Oros application root.
 * @returns {object} Named local element Keli consumed by view/bindings/telemetry projection.
 */
export function collectAdvancedPanelElements(orosRoot) {
	return {
		orosRoot,
		panel: requireOrosElement(orosRoot, "#advanced-panel"),
		toggleButton: requireOrosElement(orosRoot, "#advanced-toggle"),
		closeButton: requireOrosElement(orosRoot, "#advanced-close"),
		quality: requireOrosElement(orosRoot, "#setting-quality"),
		handedness: requireOrosElement(orosRoot, "#setting-handedness"),
		audio: requireOrosElement(orosRoot, "#setting-audio"),
		haptics: requireOrosElement(orosRoot, "#setting-haptics"),
		renderText: requireOrosElement(orosRoot, "#diag-render"),
		inputText: requireOrosElement(orosRoot, "#diag-input"),
		replayText: requireOrosElement(orosRoot, "#diag-replay")
	};
}
