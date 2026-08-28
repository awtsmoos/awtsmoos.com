// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorPreflightDomain.js
 * @description
 * The Awtsmoos lets several narrow auditors become one production gate without allowing the gate to alter the project it judges;
 * Awtsmoos.com aggregates only observed document and render-runtime evidence, then returns counts and findings detached from every live ledger.
 */

import { BinahAnimatorPreflightDocumentRules } from '../preflight/AnimatorPreflightDocumentRules.js';
import { YesodAnimatorPreflightRenderableRules } from '../preflight/AnimatorPreflightRenderableRules.js';

const OR_RULES = Object.freeze([
	['document.present', 'Studio document is installed.'],
	['document.valid', 'Studio document satisfies canonical codec validation.'],
	['relationship.target-exists', 'Renderable dependency targets exist.'],
	['renderable.texture-eligible', 'Every Studio drawable retains universal texture eligibility.'],
	['renderable.representation-known', 'Authored render representation keys are recognized.'],
	['renderable.2_5d-runtime', 'Enabled 2.5D surfaces have WebGL runtime availability.']
]);

/** Runs read-only project and universal-render audits against current canonical state. */
export class GevurahAnimatorPreflightDomain {
	/** @param {object} malchusStore Shared NLE store. @param {object} keterRuntime Runtime context. */
	constructor(malchusStore, keterRuntime = {}) {
		this.malchusStore = malchusStore;
		this.keterRuntime = keterRuntime;
	}

	/** @returns {object} Preflight guarantees and coverage summary. */
	capabilities() {
		return {
			readOnly: true,
			automaticFixes: false,
			findingSeverities: ['info', 'warning', 'error'],
			ruleCount: OR_RULES.length,
			coverage: ['document', 'dependencies', 'renderable', 'texture-eligibility', '2.5d-runtime']
		};
	}

	/** @returns {object[]} Stable preflight rule descriptors. */
	rules() {
		return OR_RULES.map(([id, description]) => ({ id, description }));
	}

	/** @returns {object} Complete project audit report. */
	run() {
		const keliDocument = this.malchusStore.get().studioDocument ?? null;
		const sederFindings = [
			...BinahAnimatorPreflightDocumentRules.inspect(keliDocument),
			...YesodAnimatorPreflightRenderableRules.inspect(keliDocument, this.keterRuntime)
		];
		return {
			valid: !sederFindings.some((keli) => keli.severity === 'error'),
			counts: this.counts(sederFindings),
			findings: structuredClone(sederFindings)
		};
	}

	/** @param {object[]} sederFindings Findings. @returns {object} Severity counts. */
	counts(sederFindings) {
		return {
			info: sederFindings.filter((keli) => keli.severity === 'info').length,
			warning: sederFindings.filter((keli) => keli.severity === 'warning').length,
			error: sederFindings.filter((keli) => keli.severity === 'error').length
		};
	}
}
