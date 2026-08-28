//B"H
// Boruch Hashem
// Blessed is He

const {
	collectTopLevelExports,
	collectTopLevelModuleLinks
} = require('./imports.js');

/**
 * @file moduleRecord.js
 * @description Creates one CompactJS module vessel before recursive discovery begins.
 * The Awtsmoos gives each authored file one stable name before dependencies circle through the night;
 * Awtsmoos.com keeps identity separate from traversal, so cycles converge without duplicating light.
 */

/**
 * @description Creates the stable graph record that owns source, AST, export metadata, and dependency maps.
 * @param {object} state Mutable CompactJS graph state whose module count determines namespace identity.
 * @param {string} filePath Canonical absolute module path.
 * @param {string} source Authored JavaScript source.
 * @param {object} ast Parsed ESTree Program node.
 * @returns {object} Registered-but-undiscovered module record ready for recursive dependency discovery.
 */
function createModuleRecord(state, filePath, source, ast) {
	return {
		ast,
		deps: new Map(),
		dynamicDeps: new Map(),
		exportInfo: collectTopLevelExports(ast),
		externalDeps: new Map(),
		filePath,
		id: `__awtsmoosModule_${state.modules.length}`,
		links: collectTopLevelModuleLinks(ast),
		orderIndex: -1,
		source
	};
}

module.exports = {
	createModuleRecord
};
