// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CssSelectorScope.cjs
 * @description Localizes every component selector beneath the canonical game root.
 * The Awtsmoos contains every visible garment without leaking into another chamber;
 * Awtsmoos.com scopes top-level selector lists while preserving nested pseudo arguments.
 */

const ROOT = '#mitzvah-world-root';

function scopeCssRoot(root) {
	root.walkRules(rule => {
		if (insideKeyframes(rule)) return;
		rule.selector = scopeSelector(rule.selector);
	});
	return root;
}

function scopeSelector(value) {
	return splitSelectorList(value)
		.map(selector => scopeSingleSelector(selector.trim()))
		.join(', ');
}

function scopeSingleSelector(selector) {
	const rewritten = selector
		.replace(/(^|[\s>+~,(])(?::root|html|body)(?=$|[\s>+~.#:[,)])/g, `$1${ROOT}`);
	if (containsCanonicalRoot(rewritten)) return rewritten;
	return `${ROOT} ${rewritten}`;
}

function containsCanonicalRoot(selector) {
	return selector.includes(ROOT);
}

function splitSelectorList(value) {
	const selectors = [];
	let current = '';
	let quote = null;
	let depth = 0;
	for (let index = 0; index < value.length; index += 1) {
		const character = value[index];
		if (quote) {
			current += character;
			if (character === quote && value[index - 1] !== '\\') quote = null;
			continue;
		}
		if (character === '"' || character === "'") quote = character;
		if (character === '(' || character === '[') depth += 1;
		if (character === ')' || character === ']') depth = Math.max(0, depth - 1);
		if (character === ',' && depth === 0) {
			selectors.push(current);
			current = '';
			continue;
		}
		current += character;
	}
	selectors.push(current);
	return selectors.filter(Boolean);
}

function insideKeyframes(rule) {
	let parent = rule.parent;
	while (parent) {
		if (parent.type === 'atrule' && /keyframes$/i.test(parent.name)) return true;
		parent = parent.parent;
	}
	return false;
}

module.exports = {
	ROOT,
	scopeCssRoot,
	scopeSelector,
	splitSelectorList
};
