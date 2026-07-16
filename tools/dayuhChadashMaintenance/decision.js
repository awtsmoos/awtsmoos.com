// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MaintenanceDecision
 * @description
 * The Awtsmoos separates an alarm from an action. Canonical family defects and
 * removable derived work may recycle production; a broad budget violation alone
 * remains visible as architectural debt and can never create a restart loop.
 */

function familyDecision(family, policy) {
	const reasons = [];
	let mode = 'vacuum';
	if (family.walBytes > policy.walLimitBytes) reasons.push('wal-present');
	if (family.verification && family.verification.ok === false) {
		reasons.push('verification-failed');
		mode = 'logical-recovery';
	}
	if (family.reclaimableBytes >= policy.minimumReclaimBytes
		&& family.physicalRatio >= policy.maximumPhysicalRatio) {
		reasons.push('reclaim-threshold');
	}
	return {
		family: family.family,
		mode,
		due: reasons.length > 0,
		reasons,
		reclaimableBytes: family.reclaimableBytes,
		physicalRatio: family.physicalRatio,
		walBytes: family.walBytes
	};
}

function maintenanceDecision(inventory, policy) {
	const families = Object.values(inventory.families)
		.map(family => familyDecision(family, policy));
	const rootWarning = inventory.allocatedBytes > policy.warningBytes;
	const rootHardLimit = inventory.allocatedBytes > policy.hardLimitBytes;
	const runtimeAssetHardLimit = inventory.runtimeAssetBytes
		> policy.runtimeAssetLimitBytes;
	const familyMaintenance = families.some(family => family.due);
	const derivedMaintenance = Number(inventory.derived?.count || 0) > 0;
	const maintenanceRequired = familyMaintenance || derivedMaintenance;
	const budgetViolation = rootHardLimit || runtimeAssetHardLimit;
	return {
		capturedAt: inventory.capturedAt,
		allocatedBytes: inventory.allocatedBytes,
		runtimeAssetBytes: inventory.runtimeAssetBytes,
		warningBytes: policy.warningBytes,
		hardLimitBytes: policy.hardLimitBytes,
		runtimeAssetLimitBytes: policy.runtimeAssetLimitBytes,
		rootWarning,
		rootHardLimit,
		runtimeAssetHardLimit,
		derivedMaintenance,
		families,
		maintenanceRequired,
		blockProductionStart: maintenanceRequired && budgetViolation,
		requiresArchitecture: budgetViolation && !maintenanceRequired,
		reasons: reasons({
			rootWarning,
			rootHardLimit,
			runtimeAssetHardLimit,
			derivedMaintenance,
			families
		})
	};
}

function reasons(values) {
	return [
		...(values.rootWarning ? ['root-warning-budget'] : []),
		...(values.rootHardLimit ? ['root-hard-budget'] : []),
		...(values.runtimeAssetHardLimit ? ['runtime-asset-hard-budget'] : []),
		...(values.derivedMaintenance ? ['derived-cleanup-available'] : []),
		...values.families.filter(family => family.due)
			.map(family => `family:${family.family}:${family.reasons.join('+')}`)
	];
}

module.exports = {
	familyDecision,
	maintenanceDecision,
	reasons
};