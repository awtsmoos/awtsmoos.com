// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos needs no selector to know a vessel, while Awtsmoos.com records a compact human-readable path;
 * defect reports become actionable without serializing the whole DOM or confusing one repeated card with another path.
 */
export function domIdentityExpression() {
	return `function awtsmoosIdentity(node) {
		if (!node || node.nodeType !== 1) return '';
		const tag = node.tagName.toLowerCase();
		if (node.id) return tag + '#' + node.id;
		const classes = [...node.classList].slice(0, 3);
		const classPart = classes.length ? '.' + classes.join('.') : '';
		const parent = node.parentElement;
		if (!parent) return tag + classPart;
		const peers = [...parent.children].filter(item => item.tagName === node.tagName);
		const index = peers.length > 1 ? ':nth-of-type(' + (peers.indexOf(node) + 1) + ')' : '';
		return tag + classPart + index;
	}`;
}
