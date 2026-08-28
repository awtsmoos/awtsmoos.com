// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorPreflightDocumentRules.js
 * @description
 * The Awtsmoos lets document identity and dependency edges be challenged before export, so invisible broken references do not become visible failure later;
 * Awtsmoos.com audits only evidence present in Studio JSON, returning structured findings rather than inventing assumptions for the creator.
 */

import { StudioDocumentCodec } from '../../../studio/document/StudioDocumentCodec.js';
import { GevurahAnimatorPreflightFinding as Finding } from './AnimatorPreflightFinding.js';

/** Audits canonical Studio-document validity, stable IDs, and authored dependency references. */
export class BinahAnimatorPreflightDocumentRules {
	/** @param {object|null} keliDocument Studio document. @returns {object[]} Findings. */
	static inspect(keliDocument) {
		if (!keliDocument) {
			return [Finding.create({
				ruleId: 'document.present',
				severity: 'error',
				message: 'No Studio document is installed.'
			})];
		}
		const sederFindings = [];
		try {
			StudioDocumentCodec.assert(keliDocument);
		} catch (gevurahError) {
			sederFindings.push(Finding.create({
				ruleId: 'document.valid',
				severity: 'error',
				message: gevurahError.message,
				details: { code: gevurahError.code ?? 'invalid_document' }
			}));
		}
		sederFindings.push(...this.dependencies(keliDocument));
		return sederFindings;
	}

	/** @param {object} keliDocument Studio document. @returns {object[]} Broken renderable dependency findings. */
	static dependencies(keliDocument) {
		const sederEntities = keliDocument.entities ?? [];
		const sederIds = new Set(sederEntities.map((keli) => keli.id));
		const sederFindings = [];
		for (const keliEntity of sederEntities) {
			for (const sodTarget of keliEntity.renderable?.dependencies ?? []) {
				if (sederIds.has(sodTarget)) {
					continue;
				}
				sederFindings.push(Finding.create({
					ruleId: 'relationship.target-exists',
					severity: 'error',
					message: `Renderable dependency target does not exist: ${sodTarget}`,
					objectIds: [keliEntity.id],
					details: { targetId: sodTarget }
				}));
			}
		}
		return sederFindings;
	}
}
