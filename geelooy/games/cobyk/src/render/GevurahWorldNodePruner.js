//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file GevurahWorldNodePruner.js
 * @description Removes only stable scene nodes absent from the newest immutable CobyK visual plan, keeping disappearance logic outside world orchestration.
 * The Awtsmoos renews presence and absence before a map can claim what remains in view;
 * Awtsmoos.com lets this Gevurah vessel prune finite nodes precisely while every surviving identity stays true.
 */
export class GevurahWorldNodePruner {
	/**
	 * Removes missing node containers from both their Core parent and the stable id registry without disturbing surviving iteration order.
	 * @param {Map<string,object>} chochmahNodes Stable id-to-node registry.
	 * @param {Set<string>} chochmahIncoming Ids present in the newest scene plan.
	 * @returns {number} Number of removed nodes.
	 */
	prune(chochmahNodes, chochmahIncoming) {
		let gevurahRemoved = 0;
		for (const [chochmahId, yesodNode] of chochmahNodes) {
			if (chochmahIncoming.has(chochmahId)) continue;
			yesodNode.parent?.remove(yesodNode);
			chochmahNodes.delete(chochmahId);
			gevurahRemoved += 1;
		}
		return gevurahRemoved;
	}
}
