// B"H

/**
 * @file structure/map/rootPromotion.js
 * @chapter A Shattered Root Becomes A Higher Crown
 * @description Promotes a root split into a new internal B-tree root.
 */

function promoteRoot(nodeIO, result) {
	if (!result?.split) return result.newSeal;
	return nodeIO.save({
		isLeaf: false,
		keys: [result.split.key],
		children: [result.split.nodeSeal, result.split.siblingSeal]
	});
}

module.exports = promoteRoot;
