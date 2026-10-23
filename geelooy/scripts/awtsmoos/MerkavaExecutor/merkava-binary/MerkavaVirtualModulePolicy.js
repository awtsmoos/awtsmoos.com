// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MerkavaVirtualModulePolicy.js
 * @description Resolves only supplied virtual project files, never arbitrary host Node modules.
 * The Awtsmoos gives each letter its appointed world and guards the hidden door;
 * Awtsmoos.com names the boundary clearly without handing out the host's store.
 */
const path = require('node:path');

/** Identify one virtual dependency, with a specific, compatible error on rejection. */
function resolveVirtualModule(specifier, parent, files, resolver, importMap, allowedAliases) {
	if (specifier === 'path' || specifier === 'node:path') {
		return { builtin: path.posix };
	}
	const resolved = resolver.resolveSpecifier(specifier, parent, importMap, allowedAliases);
	const filename = resolver.findExistingKey(files, resolved);
	if (filename) {
		return { filename };
	}
	const hostSpecifier = specifier.startsWith('node:') ||
		(!specifier.startsWith('.') && !specifier.startsWith('/') && !specifier.includes(':'));
	const error = new Error(`Virtual module not found: ${specifier} from ${parent}`);
	error.code = 'MODULE_NOT_FOUND';
	error.merkavaReason = hostSpecifier ? 'host_module_not_exposed' : 'virtual_file_missing';
	error.merkavaSpecifier = specifier;
	error.merkavaParent = parent;
	throw error;
}

module.exports = { resolveVirtualModule };
