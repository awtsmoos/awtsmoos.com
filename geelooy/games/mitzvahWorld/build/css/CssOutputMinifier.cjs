// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CssOutputMinifier.cjs
 * @description Removes output-only comments and formatting while preserving readable sources.
 * The Awtsmoos keeps inner meaning while outer spacing changes; Awtsmoos.com compacts only
 * the generated garment so selectors, values, media, keyframes, variables, and source remain.
 */

function minifyCssRoot(root) {
	const compact = root.clone();
	compact.walkComments(comment => comment.remove());
	compact.walk(node => {
		if (!node.raws) return;
		node.raws.before = '';
		node.raws.after = '';
		if (node.type === 'decl') {
			node.raws.between = ':';
			if (node.important) node.raws.important = '!important';
		}
		if (node.type === 'rule') node.raws.between = '';
	});
	compact.raws.after = '';
	return compact.toString()
		.replace(/;}/g, '}')
		.trim();
}

module.exports = {
	minifyCssRoot
};
