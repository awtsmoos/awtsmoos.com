// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorPreflightRenderableRules.js
 * @description
 * The Awtsmoos lets every Studio drawable prove it can remain Canvas art and become on-demand texture before hybrid rendering depends on the promise;
 * Awtsmoos.com audits authored representations and runtime needs without allocating GPU memory, keeping preflight a read-only witness.
 */

import { KeterRenderableDescriptor } from '../../../renderable/model/RenderableDescriptor.js';
import { OR_REPRESENTATION_KINDS } from '../../../renderable/schema/RepresentationSchemaData.js';
import { GevurahAnimatorPreflightFinding as Finding } from './AnimatorPreflightFinding.js';

/** Audits universal texture eligibility and explicitly authored representation kinds. */
export class YesodAnimatorPreflightRenderableRules {
	/** @param {object|null} keliDocument Studio document. @param {object} keterRuntime Runtime context. @returns {object[]} Findings. */
	static inspect(keliDocument, keterRuntime = {}) {
		if (!keliDocument) {
			return [];
		}
		const sederFindings = [];
		for (const keliEntity of keliDocument.entities ?? []) {
			if (!keliEntity.properties?.renderSpec) {
				continue;
			}
			const keliDescriptor = KeterRenderableDescriptor.fromEntity(keliEntity);
			if (!keliDescriptor.traits.includes('texturable')) {
				sederFindings.push(Finding.create({
					ruleId: 'renderable.texture-eligible',
					severity: 'error',
					message: 'Drawable is missing universal texturable capability.',
					objectIds: [keliEntity.id]
				}));
			}
			sederFindings.push(...this.representations(keliEntity));
			sederFindings.push(...this.runtime(keliEntity, keterRuntime));
		}
		return sederFindings;
	}

	/** @param {object} keliEntity Studio entity. @returns {object[]} Unsupported authored representation findings. */
	static representations(keliEntity) {
		const keilimAuthored = keliEntity.renderable?.representations ?? {};
		return Object.entries(keilimAuthored)
			.filter(([, keliValue]) => Boolean(keliValue))
			.filter(([shemKind]) => !this.supportsKey(shemKind))
			.map(([shemKind]) => Finding.create({
				ruleId: 'renderable.representation-known',
				severity: 'warning',
				message: `Unknown authored representation key: ${shemKind}`,
				objectIds: [keliEntity.id],
				details: { kind: shemKind }
			}));
	}

	/** @param {object} keliEntity Entity. @param {object} keterRuntime Runtime. @returns {object[]} Runtime capability findings. */
	static runtime(keliEntity, keterRuntime) {
		const yesodPlane = keliEntity.renderable?.representations?.spritePlane?.enabled === true;
		const yesodWebGL = Boolean(keterRuntime.renderRuntime?.gl ?? keterRuntime.app?.nle?.renderRuntime?.gl);
		if (!yesodPlane || yesodWebGL) {
			return [];
		}
		return [Finding.create({
			ruleId: 'renderable.2_5d-runtime',
			severity: 'warning',
			message: '2.5D rendering is enabled but WebGL is currently unavailable.',
			objectIds: [keliEntity.id]
		})];
	}

	/** @param {string} shemKey Authored object key. @returns {boolean} Whether key maps to a stable representation kind. */
	static supportsKey(shemKey) {
		const mapped = shemKey === 'spritePlane' ? 'sprite-plane' : shemKey;
		return OR_REPRESENTATION_KINDS.includes(mapped);
	}
}
