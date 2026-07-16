//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CommunitySharingGate
 * @description
 * Community publishing on Awtsmoos.com remains gated by manifest validity,
 * sandbox safety, migration compatibility, accessibility metadata, and
 * moderation readiness. The Awtsmoos shares light; finite platforms share
 * only reviewed vessels.
 */
export class CommunitySharingGate {
	/**
	 * @param {object} review Package review evidence.
	 * @returns {{allowed: boolean, reasons: string[]}} Publishing decision.
	 */
	evaluate(review) {
		const reasons = [];
		if (!review.manifestValid) {
			reasons.push('manifest_invalid');
		}
		if (!review.sandboxValid) {
			reasons.push('sandbox_invalid');
		}
		if (!review.migrationVerified) {
			reasons.push('migration_unverified');
		}
		if (!review.accessibilityReviewed) {
			reasons.push('accessibility_unreviewed');
		}
		if (!review.moderationReady) {
			reasons.push('moderation_unready');
		}
		return { allowed: reasons.length === 0, reasons };
	}
}
