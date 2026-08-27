//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalRegistryIndex.js
 * @description Builds the collision-safe lookup evidence beneath an immutable semantic registry without burdening the public registry class.
 * The Awtsmoos renews every doorway before one alias can shadow another; Awtsmoos.com lets this Hod-like index preserve one canonical
 * ownership path for every friendly name, so extensibility can widen like light while ambiguity is stopped before it enters the vessel.
 */

/**
 * @description Builds an alias-to-canonical-kind index while rejecting collisions with canonical names or aliases owned by another kind.
 * @param {Map<string, object>} entries Canonical semantic kind definitions indexed by canonical name.
 * @returns {Map<string, string>} Alias-to-canonical-kind lookup map private to one registry instance.
 */
export function buildPortalAliasIndex(entries) {
	const aliases = new Map();
	for (const definition of entries.values()) {
		for (const alias of definition.aliases) {
			if (entries.has(alias) && alias !== definition.kind) {
				throw createPortalRegistryError(
					'PORTAL_ALIAS_CONFLICT',
					`Alias collides with canonical kind: ${alias}`
				);
			}
			if (aliases.has(alias) && aliases.get(alias) !== definition.kind) {
				throw createPortalRegistryError(
					'PORTAL_ALIAS_CONFLICT',
					`Alias belongs to multiple kinds: ${alias}`
				);
			}
			aliases.set(alias, definition.kind);
		}
	}
	return aliases;
}

/**
 * @description Creates one stable coded registry error so tests, generated editors, logs, and host APIs can classify semantic failures.
 * @param {string} code Machine-readable registry failure code.
 * @param {string} message Human-readable evidence describing the invalid registry state.
 * @returns {Error} Error carrying the stable `code` property.
 */
export function createPortalRegistryError(code, message) {
	const error = new Error(`B"H | ${message}`);
	error.code = code;
	return error;
}
