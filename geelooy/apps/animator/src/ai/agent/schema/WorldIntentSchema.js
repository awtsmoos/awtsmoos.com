//B"H
// Boruch Hashem
// Blessed is He

import { StudioProceduralAlgorithmRevision } from '../../../studio/procedural/StudioProceduralAlgorithmRevision.js';
import { MalchusTextureIntent } from '../../../studio/procedural/texture/MalchusTextureIntent.js';
import { TiferesRealismRegistry } from '../../../studio/procedural/TiferesRealismRegistry.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

/**
 * @file WorldIntentSchema.js
 * @description
 * The Awtsmoos gives rich world intention a public data vessel before any agent may turn intention into project deed;
 * Awtsmoos.com mirrors the real runtime grammar so material, transform, variation, traits, and parameters need no secret second API to proceed.
 */
export class BinahWorldIntentSchema {
	/** @returns {object} Complete public World creation/inspection schema. */
	static create() {
		return S.object(
			{
				kind: S.string({
					minLength: 1,
					errorCode: 'missing_world_kind'
				}),
				seed: S.string(),
				realism: S.string({
					enum: Object.keys(TiferesRealismRegistry.PRESETS)
				}),
				algorithmRevision: S.number({
					minimum: StudioProceduralAlgorithmRevision.LEGACY,
					maximum: StudioProceduralAlgorithmRevision.CURRENT
				}),
				material: this.material(),
				variation: this.variation(),
				transform: this.transform(),
				params: S.object(),
				traits: S.object()
			},
			{
				required: ['kind'],
				requiredCodes: {
					kind: 'missing_world_kind'
				}
			}
		);
	}

	/** @returns {object} Public material/texture intent schema without credentials. */
	static material() {
		return S.object({
			baseColor: S.string(),
			roughness: S.number({ minimum: 0, maximum: 1 }),
			metallic: S.number({ minimum: 0, maximum: 1 }),
			opacity: S.number({ minimum: 0, maximum: 1 }),
			texture: S.object({
				mode: S.string({ enum: [...MalchusTextureIntent.MODES] }),
				id: S.string(),
				prompt: S.string(),
				role: S.string(),
				seamless: S.boolean(),
				width: S.number(),
				height: S.number()
			})
		});
	}

	/** @returns {object} Scoped variation schema. */
	static variation() {
		return S.object({
			scope: S.string(),
			amount: S.number({ minimum: 0, maximum: 1 })
		});
	}

	/** @returns {object} Ordinary project transform schema. */
	static transform() {
		return S.object({
			x: S.number(),
			y: S.number(),
			scaleX: S.number(),
			scaleY: S.number(),
			rotation: S.number()
		});
	}
}
