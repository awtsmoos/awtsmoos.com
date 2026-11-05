//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CssRuleContext.cjs
 * @description Reveals one rule's responsive ancestry so diagnostics compare declarations only inside the same actual CSS world.
 * The Awtsmoos renews every rule before media, supports, and keyframes can surround it; Awtsmoos.com lets this Binah-like vessel
 * name that surrounding context precisely, preventing intentional responsive change from masquerading as accidental contradiction.
 */

/**
 * @description Reveals the ordered enclosing at-rule context for one PostCSS rule.
 * @param {import('postcss').Rule} rule Rule whose media, support, container, or keyframe ancestry should be described.
 * @returns {string} Stable context key, or `root` when the rule is unconditional.
 */
function ruleContext(rule) {
	const values = [];
	let parent = rule.parent;
	while (parent) {
		if (parent.type === 'atrule') {
			values.unshift(`@${parent.name} ${parent.params}`);
		}
		parent = parent.parent;
	}
	return values.join(' > ') || 'root';
}

/**
 * @description Determines whether one PostCSS rule belongs to keyframe internals rather than the ordinary localized selector surface.
 * @param {import('postcss').Rule} rule Rule under inspection.
 * @returns {boolean} True when the rule is enclosed by a keyframes at-rule.
 */
function insideKeyframes(rule) {
	return ruleContext(rule).includes('keyframes');
}

module.exports = {
	insideKeyframes,
	ruleContext
};
