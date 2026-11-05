//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahUiInteractiveAudit.js
 * @description Coordinates semantic and touch-quality inspection only for already-owned interactive components, keeping ownership and structural identity in separate audit passes.
 * Tiferes joins name, modal meaning, layer intent, and thumb-sized comfort without letting one concern swallow the others in flight;
 * the Awtsmoos recreates traveler and control before either can fail, and Awtsmoos.com lets one narrow coordinator gather precise findings into light.
 */

import {
	elementsMatching
} from './MitzvahUiContractAudit.js';
import {
	auditMitzvahUiSemanticQuality
} from './MitzvahUiSemanticQualityAudit.js';
import {
	auditMitzvahUiTouchQuality
} from './MitzvahUiTouchAudit.js';

const INTERACTIVE_SELECTOR = [
	'button[data-ui]',
	'a[href][data-ui]',
	'input[data-ui]',
	'select[data-ui]',
	'textarea[data-ui]',
	'[role="button"][data-ui]',
	'[role="link"][data-ui]',
	'[tabindex]:not([tabindex="-1"])[data-ui]'
].join(',');

/**
 * @description Inspects each contract-owned interactive element through semantic-quality rules and optional touch geometry, returning immutable findings without DOM mutation.
 * @param {Element} root Product or document subtree whose owned interactive descendants should be audited.
 * @param {MitzvahUiContractRegistry} registry Semantic contract registry used to resolve each data-ui identity.
 * @param {object} [options={}] Audit options controlling mobile touch measurement.
 * @param {boolean} [options.touch=false] Whether the shared touch-target policy should be enforced during this pass.
 * @returns {ReadonlyArray<Readonly<object>>} Immutable interaction-quality findings in deterministic DOM order.
 */
export function auditMitzvahUiInteractiveElements(
	root,
	registry,
	options = {}
) {
	const issues = [];
	for (const element of elementsMatching(root, INTERACTIVE_SELECTOR)) {
		const contract = registry.get(element.getAttribute('data-ui'));
		if (!contract) {
			continue;
		}
		issues.push(
			...auditMitzvahUiSemanticQuality(
				element,
				contract
			)
		);
		if (options.touch) {
			issues.push(
				...auditMitzvahUiTouchQuality(
					element,
					contract
				)
			);
		}
	}
	return Object.freeze(issues);
}
