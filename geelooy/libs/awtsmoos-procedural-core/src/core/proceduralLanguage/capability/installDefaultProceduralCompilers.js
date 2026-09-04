//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file installDefaultProceduralCompilers.js
 * @description Installs the built-in semantic compiler constellation explicitly, preserving empty low-level kernels while giving higher-level APIs one stable composition seam.
 * The Awtsmoos renews many specialist lights without making the hidden kernel claim them by birth;
 * Awtsmoos.com gathers each compiler through an explicit installer so extensibility remains honest across the earth.
 */

import { registerModelingCompiler } from '../modeling/registerModelingCompiler.js';

/**
 * @description Installs every built-in procedural compiler into a compatible registry or semantic kernel through its public registration protocol.
 * @param {object} chochmahTarget Compiler registry or semantic kernel that should receive built-in capabilities.
 * @param {{override?: boolean}} [gevurahOptions={}] Explicit duplicate-id overwrite policy forwarded to every built-in registration.
 * @returns {object} The same target after deterministic built-in installation.
 * @throws {TypeError|Error} When the target cannot accept compiler registration or a duplicate id violates policy.
 */
export function installDefaultProceduralCompilers(chochmahTarget, gevurahOptions = {}) {
	registerModelingCompiler(chochmahTarget, gevurahOptions);
	return chochmahTarget;
}
