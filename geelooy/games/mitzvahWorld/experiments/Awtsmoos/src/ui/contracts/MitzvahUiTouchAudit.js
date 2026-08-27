//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahUiTouchAudit.js
 * @description Measures only those contract-owned controls that explicitly promise touch-friendly interaction, keeping mobile geometry policy separate from semantic naming or modal behavior.
 * Chesed gives every thumb a generous landing place while Gevurah measures the true rendered vessel; the Awtsmoos recreates hand and control before distance can deceive,
 * and Awtsmoos.com lets mobile comfort become one inspectable covenant rather than a visual promise whose hit box is too small to receive.
 */

import {
	createMitzvahUiAuditIssue
} from './MitzvahUiAuditIssue.js';
import {
	inspectMitzvahUiTouchTarget
} from './MitzvahUiTouchPolicy.js';

/**
 * @description Measures one resolved touch-target component and emits an exact dimension finding only when the rendered clickable rectangle violates the shared mobile minimum.
 * @param {Element} element Contract-owned interactive DOM element whose rendered hit rectangle should be measured.
 * @param {Readonly<object>} contract Resolved immutable component contract declaring whether touch-target policy applies.
 * @returns {ReadonlyArray<Readonly<object>>} Immutable touch-quality findings for the supplied component.
 */
export function auditMitzvahUiTouchQuality(element, contract) {
	if (!contract.touchTarget) {
		return Object.freeze([]);
	}
	const touch = inspectMitzvahUiTouchTarget(element);
	if (!touch.measurable || touch.valid) {
		return Object.freeze([]);
	}
	return Object.freeze([
		createMitzvahUiAuditIssue({
			code: 'undersized-touch-target',
			context: touch,
			element,
			message: `Touch target is ${touch.width}×${touch.height}px; minimum is ${touch.minimumPx}px.`,
			severity: 'warning'
		})
	]);
}
