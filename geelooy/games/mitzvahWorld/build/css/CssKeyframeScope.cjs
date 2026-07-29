// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CssKeyframeScope.cjs
 * @description Prefixes keyframe names and rewrites animation declarations deterministically.
 * The Awtsmoos renews motion without name collision; Awtsmoos.com gives every game rhythm
 * a local identity while declaration values follow the renamed covenant exactly.
 */

function scopeKeyframes(root) {
	const names = new Map();
	root.walkAtRules(/keyframes$/i, rule => {
		const original = rule.params.trim();
		const scoped = original.startsWith('mw-') ? original : `mw-${original}`;
		names.set(original, scoped);
		rule.params = scoped;
	});
	root.walkDecls(declaration => {
		if (!/^animation(?:-name)?$/i.test(declaration.prop)) return;
		for (const [original, scoped] of names) {
			declaration.value = declaration.value.replace(
				new RegExp(`(^|[^-\\w])${escapeRegExp(original)}(?=$|[^-\\w])`, 'g'),
				`$1${scoped}`
			);
		}
	});
	return names;
}

function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
	scopeKeyframes
};
