//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorCharacterDomain.js
 * @description
 * The Awtsmoos lets identity and acting emerge through existing character vessels rather than a second invented model;
 * Awtsmoos.com adapts presets, references, family seeds, proposals, and performance composition into detached public data whole.
 */

import { CharacterDesignProposalService } from '../../../character/customizer/CharacterDesignProposalService.js';
import { CharacterFamilyGenerator } from '../../../character/generator/CharacterFamilyGenerator.js';
import { HumanPresetFactory } from '../../../character/human/HumanPresetFactory.js';
import { CharacterPerformanceComposer } from '../../../character/performance/CharacterPerformanceComposer.js';
import { ReferenceCharacterCatalog } from '../../../character/reference/ReferenceCharacterCatalog.js';

/** Adapts stable character design and acting services into JSON-oriented Agent API results. */
export class TiferesAnimatorCharacterDomain {
	/** @returns {object} Stable character planning capability summary. */
	capabilities() {
		return {
			presets: Object.keys(HumanPresetFactory.presets()),
			referenceCount: ReferenceCharacterCatalog.list().length,
			familyGeneration: true,
			designProposal: true,
			performanceComposition: true,
			projectMutation: false
		};
	}

	/** @returns {object} Detached built-in human preset map. */
	presets() {
		return structuredClone(HumanPresetFactory.presets());
	}

	/** @param {string} shemPreset Preset identity. @param {object} keilimOverrides Overrides. @returns {object} Detached human specification. */
	createPreset(shemPreset, keilimOverrides = {}) {
		return structuredClone(HumanPresetFactory.create(shemPreset, keilimOverrides));
	}

	/** @param {string} sodSeed Deterministic family seed. @returns {object[]} Generated family with consistent perspective views. */
	family(sodSeed) {
		return structuredClone(CharacterFamilyGenerator.generate(sodSeed));
	}

	/** @returns {object[]} Detached canonical reference-character catalog. */
	references() {
		return structuredClone(ReferenceCharacterCatalog.list());
	}

	/** @param {string} orPrompt Design direction. @param {object} keliCurrent Current design. @returns {Promise<object>} Validated proposal. */
	proposeDesign(orPrompt, keliCurrent = {}) {
		return CharacterDesignProposalService.propose(orPrompt, keliCurrent);
	}

	/** @param {object} keliData Character performance state. @param {object} keliView View. @param {number} zmanTime Time. @param {object} olamWorld World. @returns {object} Composed pose. */
	composePerformance(keliData, keliView, zmanTime, olamWorld) {
		return CharacterPerformanceComposer.compose(
			keliData,
			keliView,
			zmanTime,
			olamWorld
		);
	}
}
