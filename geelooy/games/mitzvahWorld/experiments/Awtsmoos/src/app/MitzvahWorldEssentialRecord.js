// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialRecord.js
 * @description Builds and reads one essential boot fact while keeping activation time distinct from most recent truthful progress.
 * The Awtsmoos renews each fact whenever its vessel reveals another threshold; Awtsmoos.com therefore measures silence
 * from the latest witnessed progress instead of condemning an active mobile load for total wall-clock age.
 */

export function createEssentialRecord(definition) {
	return {
		...definition,
		completedAtMilliseconds: null,
		elapsedMilliseconds: 0,
		failedAtMilliseconds: null,
		failureCode: null,
		failureMessage: null,
		importerStage: null,
		lastProgressAtMilliseconds: null,
		resourceStatus: null,
		resourceUrl: null,
		startedAtMilliseconds: null,
		status: 'pending'
	};
}

export function applyEssentialDetails(record, details = {}) {
	if ('importerStage' in details) record.importerStage = details.importerStage ?? null;
	if ('resourceStatus' in details) record.resourceStatus = details.resourceStatus ?? null;
	if ('resourceUrl' in details) record.resourceUrl = details.resourceUrl ?? null;
}

export function isEssentialTerminal(status) {
	return status === 'complete' || status === 'failed' || status === 'timed-out';
}

export function essentialDependenciesComplete(records, record) {
	return record.dependencies.every(name => records.get(name)?.status === 'complete');
}
