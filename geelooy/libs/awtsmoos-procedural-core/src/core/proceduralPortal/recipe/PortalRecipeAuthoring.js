//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalRecipeAuthoring.js
 * @description Separates friendly authoring shorthand from canonical Portal recipe identity so convenient input never hides the data that was truly requested.
 * The Awtsmoos renews desire before description and description before form; Awtsmoos.com lets this Chochmah-like authoring vessel
 * preserve arbitrary intent, selector aliases, nested options, and dependency metadata while the identity layer remains deterministic and small.
 */

const RESERVED_KEYS = new Set([
	'actions', 'body', 'compile', 'constraints', 'dependencies', 'dependsOn', 'editor', 'extensions',
	'id', 'kind', 'metadata', 'options', 'payload', 'preset', 'resources', 'role', 'schema', 'seed',
	'species', 'type', 'value', 'version'
]);

/**
 * @description Normalizes string shorthand or object intent into a fresh mutable authoring record without mutating caller data.
 * @param {object|string} input Raw Portal authoring input.
 * @returns {object} Fresh mutable source record used only during normalization.
 */
export function normalizePortalRecipeSource(input) {
	if (typeof input === 'string') {
		return { kind: input };
	}
	if (!input || typeof input !== 'object') {
		throw new TypeError('B"H | Portal recipe input must be an object or kind string.');
	}
	return { ...input };
}

/**
 * @description Resolves the common selector aliases through which presets, species, materials, and body plans enter one primary recipe value.
 * @param {object} source Normalized authoring source record.
 * @returns {*} Explicit primary selector value or null when the kind needs no selector.
 */
export function resolvePortalRecipeValue(source) {
	return source.payload?.value
		?? source.value
		?? source.preset
		?? source.species
		?? source.role
		?? source.body
		?? null;
}

/**
 * @description Preserves arbitrary top-level intent as specialist options while explicit nested options retain final authority.
 * @param {object} source Normalized authoring source record.
 * @returns {object} Specialist option record containing every non-reserved authoring key.
 */
export function resolvePortalRecipeOptions(source) {
	const extras = Object.fromEntries(
		Object.entries(source).filter(([key]) => !RESERVED_KEYS.has(key))
	);
	return {
		...extras,
		...(source.options || {}),
		...(source.payload?.options || {})
	};
}

/**
 * @description Preserves caller extensions while making Portal dependency recipes and explicit dependency references durable canonical metadata.
 * @param {object} source Normalized authoring source record.
 * @returns {object} Extension record carrying explicit Portal dependency intent.
 */
export function createPortalRecipeExtensions(source) {
	return {
		...(source.extensions || {}),
		portal: {
			...(source.extensions?.portal || {}),
			dependencies: source.dependencies ?? source.extensions?.portal?.dependencies ?? [],
			dependsOn: source.dependsOn ?? source.extensions?.portal?.dependsOn ?? []
		}
	};
}
