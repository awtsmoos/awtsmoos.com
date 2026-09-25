// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialRecord.js
 * @description Builds and reads one essential boot fact without owning browser side effects or inventing an early start time.
 * The Awtsmoos renews each fact only when its vessel is ready to receive the next light;
 * Awtsmoos.com keeps queued milestones timeless until dependency truth opens their measured night.
 */

/** Creates one mutable internal record from an immutable definition. */
export function createEssentialRecord(definition) {
	return {
		...definition,
		completedAtMilliseconds: null,
		elapsedMilliseconds: 0,
		failedAtMilliseconds: null,
		failureCode: null,
		failureMessage: null,
		importerStage: null,
		resourceStatus: null,
		resourceUrl: null,
		startedAtMilliseconds: null,
		status: 'pending'
	};
}

/** Applies only serializable resource/importer evidence. */
export function applyEssentialDetails(record, details = {}) {
	if ('importerStage' in details) {
		record.importerStage = details.importerStage ?? null;
	}
	if ('resourceStatus' in details) {
		record.resourceStatus = details.resourceStatus ?? null;
	}
	if ('resourceUrl' in details) {
		record.resourceUrl = details.resourceUrl ?? null;
	}
}

/** Returns whether a milestone can no longer transition. */
export function isEssentialTerminal(status) {
	return status === 'complete' || status === 'failed' || status === 'timed-out';
}

/** Returns whether all declared dependencies have completed. */
export function essentialDependenciesComplete(records, record) {
	return record.dependencies.every(name => records.get(name)?.status === 'complete');
}
