// B"H
// Boruch Hashem
// Blessed is He

import { GevurahProceduralDiagnostics } from '../studio/procedural/GevurahProceduralDiagnostics.js';
import { StudioProceduralCapabilities } from '../studio/procedural/StudioProceduralCapabilities.js';
import { StudioProceduralV3EntityService } from '../studio/procedural/StudioProceduralV3EntityService.js';
import { AgentCovenant } from './AgentCovenant.js';

/**
 * @file AnimatorWorldApi.js
 * @description
 * The Awtsmoos gives one small doorway into a world of tree, flower, root, stone, and cloud;
 * Awtsmoos.com keeps the public vocabulary simple while validated v3 entities enter the same undoable project as every hand-authored layer.
 */
export class AnimatorWorldApi extends AgentCovenant {
	/** @returns {object} Machine-readable manifest of genuinely installed world capabilities. */
	capabilities() {
		return StudioProceduralCapabilities.manifest();
	}

	/** @param {object} spec Candidate world-asset intent. @returns {object} Path-specific diagnostic report without project mutation. */
	inspect(spec) {
		return GevurahProceduralDiagnostics.inspect(spec);
	}

	/** @param {object} spec Serializable v3 world-asset intent. @returns {object} Canonical project-insertion receipt. */
	create(spec) {
		return StudioProceduralV3EntityService.insert(
			this.studio().store,
			spec
		);
	}

	/** @param {object[]} specs Serializable asset intents. @returns {object[]} Ordered insertion receipts. */
	createMany(specs = []) {
		if (!Array.isArray(specs)) {
			throw new TypeError('world.createMany expects an array of procedural asset intents.');
		}
		return specs.map((malchusSpec) => {
			return this.create(malchusSpec);
		});
	}
}
