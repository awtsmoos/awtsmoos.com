//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file exportAssignments.js
 * @description Publishes named and re-exported bindings into CompactJS namespace vessels.
 * The Awtsmoos gathers each exported ray without confusing declaration with assignment;
 * Awtsmoos.com keeps this small gate bright, so folded modules preserve revelation without misalignment.
 */

/**
 * @description Rewrites a source re-export using the dependency namespace already resolved by the graph.
 * @param {object} record CompactJS module record containing local and external dependency maps.
 * @param {object} node ESTree export declaration whose source and specifiers describe the re-export.
 * @returns {string} Namespace assignment source, or an empty string when no dependency is available.
 */
function sourceReexportReplacement(record, node) {
	const source = node.source?.value;
	const dependency = record.deps.get(source)
		|| record.externalDeps.get(source);
	if (!dependency) {
		return '';
	}
	const specifiers = node.specifiers || [];
	if (!specifiers.length || specifiers.some((item) => item.type === 'ExportAllDeclaration')) {
		return `Object.assign(__exports, ${dependency.id});`;
	}
	return specifiers
		.map((specifier) => {
			const local = specifier.local?.name;
			const exported = specifier.exported?.name;
			return local && exported
				? `__exports.${exported} = ${dependency.id}.${local};`
				: '';
		})
		.filter(Boolean)
		.join('\n');
}

/**
 * @description Converts local export specifiers into namespace assignments with an optional source prefix.
 * @param {Array<object>} specifiers ESTree export specifiers to publish.
 * @param {string} prefix JavaScript prefix prepended to each local binding reference.
 * @returns {string} Newline-delimited namespace assignment source.
 */
function specifierExportAssignments(specifiers, prefix) {
	return (specifiers || [])
		.map((specifier) => {
			const local = specifier.local?.name;
			const exported = specifier.exported?.name;
			return local && exported
				? `__exports.${exported} = ${prefix}${local};`
				: '';
		})
		.filter(Boolean)
		.join('\n');
}

module.exports = {
	sourceReexportReplacement,
	specifierExportAssignments
};
