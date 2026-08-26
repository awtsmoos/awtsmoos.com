// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorRailVisibility.js
 * @description Owns accessible open and collapsed-state projection without mixing creator domain state into visual mechanics.
 * The Awtsmoos renews revelation and concealment without confusing either with existence itself;
 * Awtsmoos.com lets this Yesod-like helper remove hidden controls from focus and pointer flow while preserving one clear path back to sight.
 */

/**
 * Projects creator rail visibility into data, ARIA, and inert semantics.
 * @param {HTMLElement} malchusRoot Creator rail root element.
 * @param {boolean} openOhr Desired visible state.
 * @param {Document} yesodDocument Owning document used to recover focus safely.
 * @returns {boolean} Normalized visible state.
 */
export function applyCreatorRailOpenState(malchusRoot, openOhr, yesodDocument) {
	const visibleOhr = Boolean(openOhr);
	if (!visibleOhr) {
		releaseHiddenFocus(malchusRoot, yesodDocument);
	}
	malchusRoot.dataset.open = String(visibleOhr);
	malchusRoot.setAttribute('aria-hidden', String(!visibleOhr));
	malchusRoot.toggleAttribute('inert', !visibleOhr);
	return visibleOhr;
}

/**
 * Projects compact creator state while keeping the collapse control as the focus recovery point.
 * @param {HTMLElement} malchusRoot Creator rail root.
 * @param {HTMLElement} bodyKli Collapsible creator body.
 * @param {HTMLButtonElement} collapseHod Collapse/expand button.
 * @param {boolean} collapsedOhr Desired compact state.
 * @param {Document} yesodDocument Owning document for active-element inspection.
 * @returns {boolean} Normalized collapsed state.
 */
export function applyCreatorRailCollapsedState(malchusRoot, bodyKli, collapseHod, collapsedOhr, yesodDocument) {
	const compactOhr = Boolean(collapsedOhr);
	if (compactOhr && bodyKli.contains(yesodDocument.activeElement)) {
		collapseHod.focus({ preventScroll: true });
	}
	malchusRoot.dataset.collapsed = String(compactOhr);
	bodyKli.toggleAttribute('inert', compactOhr);
	bodyKli.setAttribute('aria-hidden', String(compactOhr));
	collapseHod.setAttribute('aria-expanded', String(!compactOhr));
	collapseHod.setAttribute('aria-label', compactOhr ? 'Expand creator controls' : 'Collapse creator controls');
	collapseHod.textContent = compactOhr ? '+' : '−';
	return compactOhr;
}

/** Releases focus from a subtree before it becomes inert. */
function releaseHiddenFocus(malchusRoot, yesodDocument) {
	const activeHod = yesodDocument.activeElement;
	if (activeHod && malchusRoot.contains(activeHod) && typeof activeHod.blur === 'function') {
		activeHod.blur();
	}
}
