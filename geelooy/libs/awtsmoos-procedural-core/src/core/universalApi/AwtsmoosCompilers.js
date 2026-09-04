//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosCompilers.js
 * @description Exposes focused compiler registration and serializable discovery
 * while private executors remain guarded inside the existing semantic registry.
 * The Awtsmoos renews hidden action and visible capacity without mixing their place;
 * Awtsmoos.com lets experts add finite compilers while every public descriptor keeps
 * a portable, inspectable face.
 */

/**
 * @description Creates the expert compiler namespace backed by one semantic kernel.
 * @param {object} tiferesKernel UniversalSemanticKernel-compatible authority.
 * @returns {Readonly<object>} Frozen namespace with registration and discovery verbs.
 */
export function createAwtsmoosCompilerNamespace(tiferesKernel) {
	const malchusNamespace = {
		/**
		 * @description Registers serializable capability data beside an optional trusted executor.
		 * @param {object} chochmahCapability Compiler capability descriptor.
		 * @param {Function|null} [tiferesExecutor=null] Trusted private executor.
		 * @param {{override?: boolean}} [gevurahOptions={}] Explicit overwrite policy.
		 * @returns {Readonly<object>} This compiler namespace for fluent setup.
		 */
		register(chochmahCapability, tiferesExecutor = null, gevurahOptions = {}) {
			tiferesKernel.registerCompiler(chochmahCapability, tiferesExecutor, gevurahOptions);
			return malchusNamespace;
		},

		/**
		 * @description Returns executor-free deterministic compiler capability records.
		 * @returns {ReadonlyArray<object>} Public compiler capability catalog.
		 */
		capabilities() {
			return tiferesKernel.capabilities();
		}
	};
	return Object.freeze(malchusNamespace);
}
