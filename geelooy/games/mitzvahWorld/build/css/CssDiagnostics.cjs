// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CssDiagnostics.cjs
 * @description Detects scoped leakage, divergent keyframes, variable conflicts, and overrides.
 * The Awtsmoos permits many declarations without contradiction; Awtsmoos.com distinguishes
 * responsive context from true collision so production rejects only evidence-bearing conflicts.
 */

const ROOT = '#mitzvah-world-root';

function diagnoseCss(root) {
	const diagnostics = {
		customPropertyConflicts: [],
		duplicateKeyframes: [],
		globalLeakage: [],
		overrides: [],
		zIndexConflicts: []
	};
	const keyframes = new Map();
	const declarations = new Map();
	const variables = new Map();
	const zIndexes = new Map();
	root.walkAtRules(/keyframes$/i, rule => {
		const body = rule.nodes?.map(node => node.toString()).join('|') || '';
		const previous = keyframes.get(rule.params);
		if (previous && previous !== body) {
			diagnostics.duplicateKeyframes.push(rule.params);
		}
		keyframes.set(rule.params, body);
	});
	root.walkRules(rule => {
		if (!insideKeyframes(rule) && !rule.selector.includes(ROOT)) {
			diagnostics.globalLeakage.push(rule.selector);
		}
		const context = ruleContext(rule);
		rule.walkDecls(declaration => {
			const key = `${context}|${rule.selector}|${declaration.prop}`;
			const previous = declarations.get(key);
			if (previous && previous !== declaration.value) {
				diagnostics.overrides.push({ key, next: declaration.value, previous });
			}
			declarations.set(key, declaration.value);
			if (declaration.prop.startsWith('--')) {
				const variablePrevious = variables.get(key);
				if (variablePrevious && variablePrevious !== declaration.value) {
					diagnostics.customPropertyConflicts.push({
						key,
						next: declaration.value,
						previous: variablePrevious
					});
				}
				variables.set(key, declaration.value);
			}
			if (declaration.prop === 'z-index') recordZIndex(context, rule.selector, declaration.value);
		});
	});
	return diagnostics;

	function recordZIndex(context, selector, value) {
		const key = `${context}|${value}`;
		const owners = zIndexes.get(key) || [];
		owners.push(selector);
		zIndexes.set(key, owners);
		if (owners.length === 5) diagnostics.zIndexConflicts.push({ owners, value });
	}
}

function ruleContext(rule) {
	const values = [];
	let parent = rule.parent;
	while (parent) {
		if (parent.type === 'atrule') values.unshift(`@${parent.name} ${parent.params}`);
		parent = parent.parent;
	}
	return values.join(' > ') || 'root';
}

function insideKeyframes(rule) {
	return ruleContext(rule).includes('keyframes');
}

module.exports = {
	diagnoseCss
};
