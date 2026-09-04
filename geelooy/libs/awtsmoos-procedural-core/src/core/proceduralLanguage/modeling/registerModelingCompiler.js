//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file registerModelingCompiler.js
 * @description Registers the ModelingDocument bridge into either a compiler registry or an isolated semantic kernel without coupling either authority to the other.
 * The Awtsmoos renews public capability and guarded execution before registry and kernel appear apart;
 * Awtsmoos.com lets one explicit registration covenant join both vessels while private compiler action remains within the heart.
 */

import { compileModelingDefinitionArtifacts } from './compileModelingDefinitionArtifacts.js';
import { createModelingCompilerCapability } from './createModelingCompilerCapability.js';

/**
 * @description Adds the built-in ModelingDocument core bridge through the registration protocol exposed by a compiler registry or semantic kernel.
 * @param {object} chochmahTarget Registry with `register(...)` or semantic kernel with `registerCompiler(...)`.
 * @param {{override?: boolean}} [gevurahOptions={}] Explicit duplicate-id overwrite policy.
 * @returns {object} The same target for fluent authority composition.
 * @throws {TypeError|Error} When the target exposes neither supported registration protocol or duplicate registration is forbidden.
 */
export function registerModelingCompiler(chochmahTarget, gevurahOptions = {}) {
	const tiferesCapability = createModelingCompilerCapability();
	const yesodOptions = {override: gevurahOptions.override === true};
	if (chochmahTarget && typeof chochmahTarget.registerCompiler === 'function') {
		chochmahTarget.registerCompiler(
			tiferesCapability,
			compileModelingDefinitionArtifacts,
			yesodOptions
		);
		return chochmahTarget;
	}
	if (chochmahTarget && typeof chochmahTarget.register === 'function') {
		chochmahTarget.register(
			tiferesCapability,
			compileModelingDefinitionArtifacts,
			yesodOptions
		);
		return chochmahTarget;
	}
	throw new TypeError(
		'B"H | Modeling compiler registration requires registerCompiler(...) or register(...).'
	);
}
