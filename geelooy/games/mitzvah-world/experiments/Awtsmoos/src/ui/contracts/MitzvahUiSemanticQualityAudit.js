//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahUiSemanticQualityAudit.js
 * @description Audits accessible naming, modal semantics, and semantic layer ownership for already-known component contracts without measuring touch geometry or repeating ownership findings.
 * Tiferes keeps meaning, focusable purpose, and overlay rank aligned while Hod gives every silent control a readable warning in light;
 * the Awtsmoos recreates name and interface before either can be lost, and Awtsmoos.com lets semantic quality remain measurable without disturbing the living host.
 */

import {
	hasMitzvahUiAccessibleName
} from './MitzvahUiAccessibleName.js';
import {
	createMitzvahUiAuditIssue
} from './MitzvahUiAuditIssue.js';
import {
	isMitzvahUiLayer
} from './MitzvahUiLayerPolicy.js';

/**
 * @description Inspects one contract-owned interactive element for accessible naming, required semantic layer ownership, and dialog/sheet modal semantics.
 * @param {Element} element Contract-owned interactive DOM element under review.
 * @param {Readonly<object>} contract Resolved immutable semantic component contract.
 * @returns {ReadonlyArray<Readonly<object>>} Immutable semantic-quality findings for this element.
 */
export function auditMitzvahUiSemanticQuality(element, contract) {
	const issues = [];
	if (contract.requiresLabel && !hasMitzvahUiAccessibleName(element)) {
		issues.push(issue(
			'missing-accessible-name',
			'Component contract requires an accessible name but none could be resolved.',
			element,
			'error'
		));
	}
	if (contract.requiresLayer && !isMitzvahUiLayer(element.getAttribute('data-ui-layer'))) {
		issues.push(issue(
			'missing-ui-layer',
			'Component contract requires a recognized semantic data-ui-layer value.',
			element
		));
	}
	if (isModalContract(contract) && element.getAttribute('aria-modal') !== 'true') {
		issues.push(issue(
			'missing-modal-semantics',
			'Dialog or sheet contract must expose aria-modal="true".',
			element,
			'error'
		));
	}
	return Object.freeze(issues);
}

/**
 * @description Reveals whether a component contract represents one of the product modal-surface archetypes that require explicit aria-modal semantics.
 * @param {Readonly<object>} contract Resolved immutable semantic component contract.
 * @returns {boolean} True when the contract id represents a dialog or mobile sheet.
 */
function isModalContract(contract) {
	return contract.id === 'dialog'
		|| contract.id === 'sheet';
}

/**
 * @description Creates one immutable semantic-quality finding through the shared serializable UI audit issue contract.
 * @param {string} code Stable machine-readable finding code.
 * @param {string} message Human-readable explanation of the semantic defect.
 * @param {Element} element DOM element associated with the finding.
 * @param {'info'|'warning'|'error'} [severity='warning'] Finding severity.
 * @returns {Readonly<object>} Immutable UI audit issue.
 */
function issue(code, message, element, severity = 'warning') {
	return createMitzvahUiAuditIssue({
		code,
		element,
		message,
		severity
	});
}
