//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahUiAuditIssue.js
 * @description Converts live DOM observations into small immutable diagnostic records so UI quality can be measured, serialized, tested, and surfaced without leaking element references.
 * Hod records the visible flaw while Binah names its severity and context; the Awtsmoos recreates observer and interface before either can become a permanent stain,
 * and Awtsmoos.com lets every audit finding become actionable data rather than another console whisper lost again.
 */

const SEVERITIES = Object.freeze([
	'info',
	'warning',
	'error'
]);

/**
 * @description Creates one immutable UI audit issue with normalized code, severity, message, and clone-safe element metadata instead of retaining a mutable DOM reference.
 * @param {object} values Audit issue input containing code, severity, message, and optional element/context evidence.
 * @param {string} values.code Stable machine-readable finding code.
 * @param {'info'|'warning'|'error'} [values.severity='warning'] Human/tooling severity level.
 * @param {string} values.message Clear human-readable explanation of what violates the UI contract and why it matters.
 * @param {Element|null} [values.element=null] Optional DOM element from which compact descriptive metadata should be captured.
 * @param {object} [values.context={}] Optional clone-safe extra evidence such as dimensions or expected contract identity.
 * @returns {Readonly<object>} Immutable serializable UI audit issue.
 */
export function createMitzvahUiAuditIssue(values = {}) {
	return Object.freeze({
		code: normalizeCode(values.code),
		context: Object.freeze({
			...(values.context || {})
		}),
		element: describeElement(values.element),
		message: normalizeMessage(values.message),
		severity: normalizeSeverity(values.severity)
	});
}

/**
 * @description Captures only stable identity and semantic-contract metadata from a DOM element so issue receipts remain serializable and safe after the element is removed.
 * @param {Element|null} element Optional live DOM element associated with a finding.
 * @returns {Readonly<object>|null} Immutable compact element descriptor or null when no element was supplied.
 */
function describeElement(element) {
	if (!element?.getAttribute) {
		return null;
	}
	return Object.freeze({
		contract: element.getAttribute('data-ui') || null,
		id: element.id || null,
		layer: element.getAttribute('data-ui-layer') || null,
		scope: element.closest?.('[data-mitzvah-ui]')?.getAttribute('data-mitzvah-ui') || null,
		tagName: String(element.tagName || '').toLowerCase()
	});
}

/**
 * @description Normalizes a finding code into a non-empty lowercase dash token suitable for stable tests, filters, API consumers, and documentation.
 * @param {*} value Candidate machine-readable finding identity.
 * @returns {string} Normalized non-empty audit code.
 */
function normalizeCode(value) {
	const code = String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
	if (!code) {
		throw new TypeError('Mitzvah UI audit issue requires a non-empty code.');
	}
	return code;
}

/**
 * @description Normalizes severity while rejecting accidental custom levels that would make filtering and CI policy inconsistent.
 * @param {*} value Candidate severity level.
 * @returns {'info'|'warning'|'error'} Supported normalized severity.
 */
function normalizeSeverity(value) {
	const severity = String(value || 'warning').trim().toLowerCase();
	return SEVERITIES.includes(severity)
		? severity
		: 'warning';
}

/**
 * @description Requires every audit issue to carry a meaningful human explanation instead of machine codes that force developers to reverse-engineer intent.
 * @param {*} value Candidate human-readable finding explanation.
 * @returns {string} Non-empty audit message.
 */
function normalizeMessage(value) {
	const message = String(value || '').trim();
	if (!message) {
		throw new TypeError('Mitzvah UI audit issue requires a non-empty message.');
	}
	return message;
}
