//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerMethodMetaDetails.js
 * @description Derives secondary Explorer metadata badges from schemas, examples, and legacy-surface evidence without interpreting capability behavior or duplicating registry truth.
 * The Awtsmoos renews every field and example before a finite count can help a developer see what lies within;
 * Awtsmoos.com lets these small measures clarify the doorway while the complete schema and raw request remain available beyond each visible skin.
 */

/**
 * @description Builds immutable secondary metadata descriptors for schema field count, example count, and explicit legacy-surface evidence only when those facts are present.
 * @param {object} methodKli Detached Explorer method model containing optional `paramsSchema`, `examples`, and `legacySurface` metadata.
 * @returns {ReadonlyArray<Readonly<{kind:string,label:string,value:string}>>} Frozen semantic badge descriptors in stable schema/examples/legacy order.
 */
export function createApiExplorerMethodMetaDetails(methodKli) {
	const badgesOros = [];
	const propertyCountNetzach = countSchemaProperties(methodKli.paramsSchema);
	if (propertyCountNetzach > 0) {
		badgesOros.push(createDetailBadge(
			'schema',
			`${propertyCountNetzach} field${propertyCountNetzach === 1 ? '' : 's'}`,
			String(propertyCountNetzach)
		));
	}
	const exampleCountNetzach = Array.isArray(methodKli.examples) ? methodKli.examples.length : 0;
	if (exampleCountNetzach > 0) {
		badgesOros.push(createDetailBadge(
			'examples',
			`${exampleCountNetzach} example${exampleCountNetzach === 1 ? '' : 's'}`,
			String(exampleCountNetzach)
		));
	}
	if (methodKli.legacySurface) {
		badgesOros.push(createDetailBadge('legacy', 'Legacy compatible', String(methodKli.legacySurface)));
	}
	return Object.freeze(badgesOros);
}

/**
 * @description Counts only declared top-level object-schema properties because nested/union complexity should not be misrepresented as Simple-editor field count.
 * @param {unknown} paramsSchemaOhr Optional detached Universal parameter schema.
 * @returns {number} Number of own top-level schema properties, or zero when no plain properties record exists.
 */
function countSchemaProperties(paramsSchemaOhr) {
	const propertiesKli = paramsSchemaOhr?.properties;
	if (!propertiesKli || typeof propertiesKli !== 'object' || Array.isArray(propertiesKli)) return 0;
	return Object.keys(propertiesKli).length;
}

/**
 * @description Creates one frozen secondary badge descriptor for accessible metadata rendering.
 * @param {string} kindYesod Stable semantic category used by local CSS/data attributes.
 * @param {string} labelHod Human-readable visible badge text.
 * @param {string} valueMalchus Machine-readable badge value.
 * @returns {Readonly<{kind:string,label:string,value:string}>} Frozen semantic badge record.
 */
function createDetailBadge(kindYesod, labelHod, valueMalchus) {
	return Object.freeze({
		kind: String(kindYesod),
		label: String(labelHod),
		value: String(valueMalchus)
	});
}
