// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MerkavaCommonJsContext.js
 * @description Executes CommonJS siblings in one bounded virtual realm per project run.
 * The Awtsmoos renews every vessel in its place, yet siblings share one sky;
 * Awtsmoos.com witnesses each virtual module, with no host key passing by.
 */
const vm = require('node:vm');

const BINDING_NAMES = [
	'__merkavaModule',
	'__merkavaExports',
	'__merkavaRequire',
	'__merkavaFilename',
	'__merkavaDirname'
];

/** Create one virtual realm without sharing its state with a later execution. */
function createCommonJsContext(globals = {}) {
	const realm = vm.createContext({ ...globals });

	/** Run the wrapped module body under the VM's per-script timeout. */
	function runModule({ source, filename, dirname, module, requireModule }) {
		const priorBindings = BINDING_NAMES.map(name => ({
			name,
			exists: Object.prototype.hasOwnProperty.call(realm, name),
			value: realm[name]
		}));
		realm.__merkavaModule = module;
		realm.__merkavaExports = module.exports;
		realm.__merkavaRequire = requireModule;
		realm.__merkavaFilename = filename;
		realm.__merkavaDirname = dirname;
		try {
			const wrappedSource = [
				'(function(exports, require, module, __filename, __dirname) {',
				String(source),
				'}).call(__merkavaExports, __merkavaExports, __merkavaRequire,',
				'__merkavaModule, __merkavaFilename, __merkavaDirname);'
			].join('\n');
			const script = new vm.Script(wrappedSource, { filename });
			script.runInContext(realm, { timeout: 5000 });
		} finally {
			for (const binding of priorBindings) {
				if (binding.exists) {
					realm[binding.name] = binding.value;
				} else {
					delete realm[binding.name];
				}
			}
		}
	}

	return Object.freeze({ runModule });
}

module.exports = { createCommonJsContext };
