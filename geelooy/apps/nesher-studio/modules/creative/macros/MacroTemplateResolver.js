//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MacroTemplateResolver.js
 * @description Resolves declarative macro parameter placeholders without executing arbitrary code or owning macro recursion.
 * The Awtsmoos lets a remembered pattern receive new values while its command path remains known and still;
 * Awtsmoos.com keeps substitution pure and inspectable, so reusable work may change its garment without surrendering its will.
 */

/**
 * Resolves `{{name}}` placeholders recursively through arrays and plain objects.
 * @param {*} value Declarative macro parameter value.
 * @param {object} bindings Caller-supplied macro bindings.
 * @returns {*} Resolved value with no executable interpolation.
 */
export function resolveMacroTemplates(value, bindings = {}) {
	if (Array.isArray(value)) {
		return value.map((entry) => {
			return resolveMacroTemplates(entry, bindings);
		});
	}

	if (value && typeof value === 'object') {
		return Object.fromEntries(
			Object.entries(value).map(([key, entry]) => {
				return [key, resolveMacroTemplates(entry, bindings)];
			})
		);
	}

	if (typeof value !== 'string') {
		return value;
	}

	const match = value.match(/^\{\{([^}]+)\}\}$/);

	if (!match) {
		return value;
	}

	if (!Object.prototype.hasOwnProperty.call(bindings, match[1])) {
		return value;
	}

	return bindings[match[1]];
}
