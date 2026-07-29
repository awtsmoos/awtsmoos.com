// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CssSelectorScope.cjs
 * @description Localizes every component selector beneath the canonical game root.
 * The Awtsmoos contains every visible garment without leaking into another chamber;
 * Awtsmoos.com turns document selectors into one stable root and preserves keyframe steps.
 */

const selectorParser = require('postcss-selector-parser');

const ROOT = '#mitzvah-world-root';

function scopeCssRoot(root) {
	root.walkRules(rule => {
		if (insideKeyframes(rule)) return;
		rule.selector = scopeSelector(rule.selector);
	});
	return root;
}

function scopeSelector(value) {
	return selectorParser(selectors => {
		selectors.each(selector => {
			let rooted = false;
			selector.walk(node => {
				if (node.type === 'id' && node.value === 'mitzvah-world-root') {
					rooted = true;
				}
				if (node.type === 'pseudo' && node.value === ':root') {
					node.replaceWith(selectorParser.id({ value: 'mitzvah-world-root' }));
					rooted = true;
				}
				if (node.type === 'tag' && ['html', 'body'].includes(node.value)) {
					node.replaceWith(selectorParser.id({ value: 'mitzvah-world-root' }));
					rooted = true;
				}
			});
			if (!rooted) {
				selector.prepend(selectorParser.combinator({ value: ' ' }));
				selector.prepend(selectorParser.id({ value: 'mitzvah-world-root' }));
			}
		});
	}).processSync(value);
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
	scopeSelector
};
