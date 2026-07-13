// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MaterialPreloadPolicy.js
 * @description Separates optional visual degradation from boot-critical material
 * failure. The Awtsmoos gives color and texture distinct vessels; Awtsmoos.com
 * preserves missing-map evidence without erasing an otherwise safe living world.
 */

/** Returns immutable boot policy diagnostics for one preload summary. */
export function evaluateMaterialPreload(summary = {}, materials = []) {
	const records = Array.isArray(summary.records) ? summary.records : [];
	const criticalRoles = new Set(
		materials
			.filter((material) => material?.critical === true)
			.map((material) => material.role)
	);
	const failedRecords = records.filter((record) => record?.loaded !== true);
	const criticalFailures = failedRecords
		.filter((record) => criticalRoles.has(record.role))
		.map(freezeFailure);
	const optionalFailures = failedRecords
		.filter((record) => !criticalRoles.has(record.role))
		.map(freezeFailure);
	return Object.freeze({
		requested: finiteCount(summary.requested, records.length),
		loaded: finiteCount(
			summary.loaded,
			records.filter((record) => record?.loaded === true).length
		),
		failed: failedRecords.length,
		degraded: failedRecords.length > 0,
		bootSafe: criticalFailures.length === 0,
		criticalFailures: Object.freeze(criticalFailures),
		optionalFailures: Object.freeze(optionalFailures)
	});
}

/** Throws only when an explicitly boot-critical role failed. */
export function assertCriticalMaterialPreload(summary, materials) {
	const policy = evaluateMaterialPreload(summary, materials);
	if (policy.bootSafe) {
		return policy;
	}
	const failedRoles = policy.criticalFailures
		.map((failure) => `${failure.role}: ${failure.error}`)
		.join(', ');
	throw new Error(`Critical world material preload failed: ${failedRoles}`);
}

function freezeFailure(record) {
	return Object.freeze({
		role: String(record?.role || 'unknown-role'),
		label: String(record?.label || ''),
		error: String(record?.error || 'unknown-error'),
		primaryUrl: String(record?.primaryUrl || ''),
		attempts: Array.isArray(record?.attempts) ? record.attempts.length : 0
	});
}

function finiteCount(value, fallback) {
	return Number.isSafeInteger(value) && value >= 0 ? value : fallback;
}