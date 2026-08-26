// B"H
// Boruch Hashem
// Blessed is He

import { StudioDocumentMutations } from '../authoring/StudioDocumentMutations.js';
import { StudioEntityFactory } from '../authoring/StudioEntityFactory.js';
import { GevurahProceduralDiagnostics } from './GevurahProceduralDiagnostics.js';
import { StudioNatureGeneratorV3 } from './StudioNatureGeneratorV3.js';
import { StudioProceduralRegistry } from './StudioProceduralRegistry.js';

/**
 * @file StudioProceduralV3EntityService.js
 * @description
 * The Awtsmoos renews rich generated geometry into the same ordinary entity vessel as hand-authored art;
 * Awtsmoos.com keeps v3 creation undoable, selectable, serializable, and owned by the canonical Studio store from the start.
 */
export class StudioProceduralV3EntityService {
	/**
	 * Creates an ordinary Studio entity from validated v3 procedural intent without mutating project state.
	 * @param {object} spec Public data-first creation intent.
	 * @returns {object} Structured preparation receipt containing the entity when valid.
	 */
	static create(spec = {}) {
		const gevurahReport = GevurahProceduralDiagnostics.inspect(spec);
		if (!gevurahReport.ok) {
			return {
				ok: false,
				action: 'createWorldAsset',
				issues: gevurahReport.issues
			};
		}
		const tiferesGeneration = StudioNatureGeneratorV3.create(
			spec.kind,
			spec.seed,
			spec
		);
		const malchusEntity = StudioEntityFactory.create({
			kind: `procedural-${spec.kind}`,
			name: `${StudioProceduralRegistry.label(spec.kind)} • v3`,
			transform: spec.transform,
			properties: {
				procedural: tiferesGeneration.descriptor,
				proceduralGeneration: this.provenance(tiferesGeneration)
			},
			renderSpec: tiferesGeneration.geometry
		});
		return {
			ok: true,
			action: 'prepareWorldAsset',
			entity: malchusEntity,
			generation: tiferesGeneration
		};
	}

	/**
	 * Inserts one prepared v3 entity through the canonical undoable Studio document mutation.
	 * @param {object} store Canonical Studio store.
	 * @param {object} spec Public creation intent.
	 * @returns {object} Compact project-ownership receipt.
	 */
	static insert(store, spec = {}) {
		const binahPrepared = this.create(spec);
		if (!binahPrepared.ok) {
			return binahPrepared;
		}
		StudioDocumentMutations.add(store, binahPrepared.entity);
		return {
			ok: true,
			action: 'createWorldAsset',
			entityId: binahPrepared.entity.id,
			kind: binahPrepared.generation.kind,
			seed: binahPrepared.generation.seed,
			descriptor: binahPrepared.generation.descriptor,
			warnings: binahPrepared.generation.warnings
		};
	}

	/** @param {object} generation Generation receipt. @returns {object} Compact serializable provenance stored beside the descriptor. */
	static provenance(generation) {
		return {
			generator: generation.generator,
			version: generation.version,
			warnings: [...(generation.warnings || [])],
			provenance: { ...(generation.provenance || {}) }
		};
	}
}
