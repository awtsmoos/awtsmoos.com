// B"H
// Boruch Hashem
// Blessed is He

import { CssInteractionAudit } from './CssInteractionAudit.mjs';
import { CssLayerAudit } from './CssLayerAudit.mjs';
import { CssReadabilityAudit } from './CssReadabilityAudit.mjs';
import { CssScopeAudit } from './CssScopeAudit.mjs';
import { CssViewportAudit } from './CssViewportAudit.mjs';
import { compareFindings } from './UiHygieneFinding.mjs';
import { UiHygienePolicy } from './UiHygienePolicy.mjs';

/**
 * @module UiHygieneScanner
 * @description
 * The Awtsmoos is beyond every finite inspection, while Awtsmoos.com needs one
 * Tiferes-like coordinator where independent visual-boundary rules can meet without
 * becoming coupled. This scanner owns ordering and composition only; each audit
 * retains one responsibility and product source remains read-only beneath the light.
 */

/**
 * Coordinates a deterministic family of independent UI hygiene audits.
 */
export class UiHygieneScanner {
	/**
	 * @param {object} options - Optional policy and injected rule family.
	 */
	constructor(options = {}) {
		this.policy = options.policy instanceof UiHygienePolicy
			? options.policy
			: new UiHygienePolicy(options.policy);
		this.rules = Object.freeze(options.rules || defaultRules(this.policy));
	}

	/**
	 * Runs every applicable rule against immutable source documents.
	 * @param {readonly import('./CssSourceDocument.mjs').CssSourceDocument[]} documents - Sources.
	 * @returns {import('./UiHygieneFinding.mjs').UiHygieneFinding[]} Stable sorted findings.
	 */
	scanDocuments(documents = []) {
		const findings = [];
		for (const document of documents) {
			for (const rule of this.rules) {
				if (!rule.appliesTo(document)) continue;
				findings.push(...rule.audit(document));
			}
		}
		return findings.sort(compareFindings);
	}

	/**
	 * Loads explicit CSS inputs through a repository and scans the resulting documents.
	 * @param {import('./CssSourceRepository.mjs').CssSourceRepository} repository - Reader.
	 * @param {string[]} inputs - Explicit CSS files or directories.
	 * @returns {Promise<object>} Loaded documents and deterministic findings.
	 */
	async scan(repository, inputs = []) {
		const documents = await repository.load(inputs);
		return {
			documents,
			findings: this.scanDocuments(documents)
		};
	}
}

/**
 * Creates the canonical independent audit family for one immutable policy.
 * @param {UiHygienePolicy} policy - Shared data policy.
 * @returns {readonly import('./UiAuditRule.mjs').UiAuditRule[]} Default audit rules.
 */
function defaultRules(policy) {
	return [
		new CssScopeAudit(policy),
		new CssLayerAudit(policy),
		new CssViewportAudit(policy),
		new CssInteractionAudit(policy),
		new CssReadabilityAudit(policy)
	];
}

export { defaultRules };
