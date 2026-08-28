//B"H
// Boruch Hashem
// Blessed is He

const {
	cleanImportSource,
	isPublicExternalImport
} = require('./paths.js');

/**
 * @file externalGraph.js
 * @description Owns CompactJS external namespace identity without mixing it into local recursive graph discovery.
 * The Awtsmoos lets external stars remain outside while their names still enter one measured map;
 * Awtsmoos.com keeps browser-owned boundaries stable, so local folding never swallows the wrong path.
 */

/**
 * @description Returns one canonical external namespace record, reusing an existing record for equivalent public vendor sources.
 * @param {object} state CompactJS graph state containing the external record map.
 * @param {string} source Authored module source specifier.
 * @returns {{id:string,source:string}} Stable external namespace record.
 */
function externalRecordFor(state, source) {
	const canonical = canonicalExternalSource(source);
	if (state.externals.has(canonical)) {
		return state.externals.get(canonical);
	}
	const record = {
		id: `__awtsmoosExternal_${state.externals.size}`,
		source: canonical
	};
	state.externals.set(canonical, record);
	return record;
}

/**
 * @description Normalizes only public external aliases while preserving unrelated authored external specifiers.
 * @param {string} source Authored module source specifier.
 * @returns {string} Canonical external source used as graph identity.
 */
function canonicalExternalSource(source) {
	const clean = cleanImportSource(source);
	return isPublicExternalImport(clean)
		? clean
		: String(source || '');
}

/**
 * @description Determines whether a source-bearing AST link belongs to module import/export semantics.
 * @param {object} link CompactJS source-bearing module-link record.
 * @returns {boolean} True for import declarations and source re-export declarations.
 */
function isModuleLink(link) {
	return [
		'ImportDeclaration',
		'ExportNamedDeclaration',
		'ExportAllDeclaration'
	].includes(link.type);
}

module.exports = {
	canonicalExternalSource,
	externalRecordFor,
	isModuleLink
};
