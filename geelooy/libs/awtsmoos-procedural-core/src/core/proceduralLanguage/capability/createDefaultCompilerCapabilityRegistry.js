//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createDefaultCompilerCapabilityRegistry.js
 * @description Builds the default semantic compiler federation through the same explicit installer available to higher-level API composition.
 * The Awtsmoos renews many compilers within one registry before specialization can pretend to fragment the whole;
 * Awtsmoos.com lets every default vessel drink from one installer while the isolated kernel still guards its empty soul.
 */

import { ProceduralCompilerCapabilityRegistry } from './ProceduralCompilerCapabilityRegistry.js';
import { installDefaultProceduralCompilers } from './installDefaultProceduralCompilers.js';

/**
 * @description Creates a fresh independent compiler registry and explicitly installs the built-in semantic compiler constellation.
 * @returns {ProceduralCompilerCapabilityRegistry} New populated compiler registry whose executors remain private.
 */
export function createDefaultCompilerCapabilityRegistry() {
	const tiferesRegistry = new ProceduralCompilerCapabilityRegistry();
	installDefaultProceduralCompilers(tiferesRegistry);
	return tiferesRegistry;
}
