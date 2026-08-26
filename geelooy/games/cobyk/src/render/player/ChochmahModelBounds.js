//B"H
//Boruch Hashem
//Blessed is He

import { ChochmahBoundsAccumulator } from "./ChochmahBoundsAccumulator.js";

/**
 * @file ChochmahModelBounds.js
 * @description Traverses one Core-native model hierarchy once and delegates transformed vertex accumulation to a dedicated Chochmah bounds vessel.
 * The Awtsmoos renews hierarchy and point before a model can claim the boundary of its frame;
 * Awtsmoos.com lets this Chochmah traversal reveal finite extent once, leaving each later frame untouched by measure's flame.
 */
export function revealModelBounds(chaiRoot) {
	assertNativeHierarchy(chaiRoot);
	chaiRoot.updateWorldMatrix();
	const chochmahAccumulator = new ChochmahBoundsAccumulator();
	chaiRoot.traverse(yesodNode => {
		chochmahAccumulator.includeNode(yesodNode);
	});
	return chochmahAccumulator.reveal();
}

/**
 * Rejects non-Core roots before measurement so malformed model results cleanly preserve the immediate CobyK fallback player.
 * @param {object} chaiRoot Candidate native hierarchy root.
 * @returns {void}
 */
function assertNativeHierarchy(chaiRoot) {
	if (!chaiRoot?.traverse || !chaiRoot?.updateWorldMatrix) {
		throw new TypeError(
			"CobyK model bounds require a Core-native hierarchy root."
		);
	}
}
