//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahUiIdentityAudit.js
 * @description Audits structural UI identity for duplicate DOM ids and unsanctioned semantic layer names without repeating component-ownership or interaction-quality findings.
 * Binah protects one name from becoming two, while Gevurah keeps each overlay inside the approved elevation grammar;
 * the Awtsmoos recreates identity and layer before either can divide, and Awtsmoos.com lets structural mistakes surface as clear receipts instead of hidden CSS confusion.
 */

import {
	createMitzvahUiAuditIssue
} from './MitzvahUiAuditIssue.js';
import {
	elementsMatching
} from './MitzvahUiContractAudit.js';
import {
	isMitzvahUiLayer
} from './MitzvahUiLayerPolicy.js';

/**
 * @description Inspects one UI subtree for duplicate ids and invalid data-ui-layer markers while retaining DOM order and producing only immutable serializable findings.
 * @param {Element} root Product or document subtree whose structural identity should be audited.
 * @returns {ReadonlyArray<Readonly<object>>} Immutable structural UI audit findings.
 */
export function auditMitzvahUiIdentity(root) {
	const issues = [];
	auditDuplicateIds(root, issues);
	auditLayerMarkers(root, issues);
	return Object.freeze(issues);
}

/**
 * @description Detects repeated non-empty DOM ids inside the audit subtree and emits one finding for every duplicate occurrence after the first owner.
 * @param {Element} root Audit root whose descendants should be inspected.
 * @param {Array<object>} issues Mutable local issue collection owned by the current audit invocation.
 * @returns {void}
 */
function auditDuplicateIds(root, issues) {
	const firstById = new Map();
	for (const element of elementsMatching(root, '[id]')) {
		const id = String(element.id || '').trim();
		if (!id) {
			continue;
		}
		if (!firstById.has(id)) {
			firstById.set(id, element);
			continue;
		}
		issues.push(createMitzvahUiAuditIssue({
			code: 'duplicate-dom-id',
			context: {
				id
			},
			element,
			message: `Duplicate DOM id detected inside MitzvahWorld UI scope: ${id}.`,
			severity: 'error'
		}));
	}
}

/**
 * @description Validates every authored semantic layer marker against the sanctioned layer vocabulary so CSS cannot silently depend on invented elevation names.
 * @param {Element} root Audit root whose descendants should be inspected.
 * @param {Array<object>} issues Mutable local issue collection.
 * @returns {void}
 */
function auditLayerMarkers(root, issues) {
	for (const element of elementsMatching(root, '[data-ui-layer]')) {
		const layer = element.getAttribute('data-ui-layer');
		if (isMitzvahUiLayer(layer)) {
			continue;
		}
		issues.push(createMitzvahUiAuditIssue({
			code: 'invalid-ui-layer',
			context: {
				layer
			},
			element,
			message: `Unknown semantic UI layer: ${layer || '(empty)'}.`,
			severity: 'warning'
		}));
	}
}
