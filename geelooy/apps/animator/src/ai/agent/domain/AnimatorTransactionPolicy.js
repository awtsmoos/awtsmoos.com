// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorTransactionPolicy.js
 * @description
 * The Awtsmoos lets many edits become one atomic deed only when every child command can rehearse without microphone, GPU, filesystem, or shared cache change;
 * Awtsmoos.com keeps transaction admission explicit so dry-run means truly dry and one Undo never conceals an external side effect in the range.
 */

const ALLOWED_SCOPES = new Set(['none', 'document']);
const FORBIDDEN_FAMILIES = new Set([
	'transaction',
	'history',
	'gpu',
	'texture',
	'audio',
	'media',
	'playback',
	'export',
	'schema'
]);

/** Determines whether canonical command metadata permits isolated transaction simulation. */
export class GevurahAnimatorTransactionPolicy {
	/** @param {object} keliDescriptor Canonical command descriptor. @returns {object} Admission report. */
	static inspect(keliDescriptor = {}) {
		const sederReasons = [];
		if (!ALLOWED_SCOPES.has(keliDescriptor.mutationScope ?? 'none')) {
			sederReasons.push(
				`mutationScope:${keliDescriptor.mutationScope ?? 'unknown'}`
			);
		}
		if (FORBIDDEN_FAMILIES.has(keliDescriptor.family)) {
			sederReasons.push(`family:${keliDescriptor.family}`);
		}
		if (['permission', 'transient', 'destructive'].includes(keliDescriptor.risk)) {
			sederReasons.push(`risk:${keliDescriptor.risk}`);
		}
		const sederEnvironment = Object.entries(keliDescriptor.environment ?? {})
			.filter(([, yesodRequired]) => Boolean(yesodRequired))
			.map(([shemRequirement]) => shemRequirement);
		if (sederEnvironment.length) {
			sederReasons.push(
				`environment:${sederEnvironment.join(',')}`
			);
		}
		return {
			allowed: sederReasons.length === 0,
			reasons: sederReasons
		};
	}

	/** @param {object} keliDescriptor Descriptor. */
	static assert(keliDescriptor) {
		const keliReport = this.inspect(keliDescriptor);
		if (keliReport.allowed) {
			return;
		}
		const gevurahError = new Error(
			`Command is not transaction-safe: ${keliDescriptor?.name ?? 'unknown'}`
		);
		gevurahError.code = 'transaction_command_not_allowed';
		gevurahError.details = keliReport;
		throw gevurahError;
	}
}
