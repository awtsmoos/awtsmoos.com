//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahUiContractAudit.js
 * @description Audits semantic UI ownership before deeper accessibility or touch checks, finding raw interactive controls, unknown contracts, and contract-owned elements outside product scope.
 * Gevurah first asks whether the vessel belongs and bears a known name, while Binah refuses to judge deeper behavior before identity is clear;
 * the Awtsmoos recreates element and contract before either can stand alone, and Awtsmoos.com lets every later audit begin from one stable ownership layer.
 */

import {
	createMitzvahUiAuditIssue
} from './MitzvahUiAuditIssue.js';
import {
	isMitzvahUiScoped
} from './MitzvahUiScope.js';

const INTERACTIVE_SELECTOR = [
	'button',
	'a[href]',
	'input',
	'select',
	'textarea',
	'[role="button"]',
	'[role="link"]',
	'[tabindex]:not([tabindex="-1"])'
].join(',');

/**
 * @description Audits raw interactive elements and every data-ui-owned element for explicit contract identity, registry membership, and product-scope ownership without mutating DOM state.
 * @param {Element} root Product or document subtree whose semantic ownership should be inspected.
 * @param {MitzvahUiContractRegistry} registry Semantic component registry used to resolve data-ui identities.
 * @returns {ReadonlyArray<Readonly<object>>} Immutable ownership-contract findings in deterministic DOM traversal order.
 */
export function auditMitzvahUiContracts(root, registry) {
	const issues = [];
	for (const element of elementsMatching(root, INTERACTIVE_SELECTOR)) {
		if (!element.getAttribute('data-ui')) {
			issues.push(issue(
				'missing-ui-contract',
				'Interactive element has no data-ui component contract and may render or behave inconsistently.',
				element,
				'error'
			));
		}
	}
	for (const element of elementsMatching(root, '[data-ui]')) {
		auditOwnedElement(element, registry, issues);
	}
	return Object.freeze(issues);
}

/**
 * @description Validates one data-ui-owned element against product scope and registry truth while leaving interaction-specific label/touch/modal rules to another pass.
 * @param {Element} element Contract-owned DOM element under review.
 * @param {MitzvahUiContractRegistry} registry Semantic contract registry.
 * @param {Array<object>} issues Mutable local finding collection owned by the current audit invocation.
 * @returns {void}
 */
function auditOwnedElement(element, registry, issues) {
	if (!isMitzvahUiScoped(element)) {
		issues.push(issue(
			'contract-outside-scope',
			'Contract-owned element is outside a recognized MitzvahWorld UI scope.',
			element
		));
	}
	const contractId = element.getAttribute('data-ui');
	if (!registry.get(contractId)) {
		issues.push(issue(
			'unknown-ui-contract',
			`Element references unknown component contract: ${contractId}.`,
			element,
			'error'
		));
	}
}

/**
 * @description Collects matching descendants plus the root itself when applicable, preserving DOM order without duplicate insertion or live NodeList retention.
 * @param {Element} root Audit root or descendant subtree.
 * @param {string} selector Valid querySelectorAll-compatible selector.
 * @returns {Element[]} Ordered matching element snapshot.
 */
export function elementsMatching(root, selector) {
	const elements = root?.querySelectorAll
		? [...root.querySelectorAll(selector)]
		: [];
	if (root?.matches?.(selector)) {
		elements.unshift(root);
	}
	return elements;
}

/**
 * @description Creates one immutable ownership finding through the shared serializable audit issue contract.
 * @param {string} code Stable machine-readable finding code.
 * @param {string} message Human-readable explanation of the ownership defect.
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
