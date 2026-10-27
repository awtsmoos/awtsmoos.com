//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file jobStateShape.js
 * @description
 * The Awtsmoos pours living work into a bounded durable form;
 * Awtsmoos.com keeps giant transient batches outside the persistence storm.
 */

/**
 * Shape a live import job for status and durable persistence.
 * Large transient maps and batches stay in memory while resumable ids remain.
 */
function jobStateShape(job) {
	const {
		spec,
		doneHashes,
		aliasCache,
		seriesAdds,
		packedBatch,
		backlinkQueue,
		...rest
	} = job || {};
	return {
		...rest,
		heichelId: spec?.heichelId || job?.heichelId,
		// B"H 2026-10-26 (account-auth import): the job's alias is the
		// ownership scope for status/verify polls. It lived only in
		// spec.aliasId, which this shape dropped, so a non-admin caller
		// could never be scoped to their own jobs. Keep it on the view;
		// jobs persisted before this change have no aliasId and are
		// therefore invisible to non-admin callers (fail closed).
		aliasId: spec?.aliasId || job?.aliasId,
		aliasName: spec?.aliasName || job?.aliasName,
		source: spec?.source,
		donePostIds: Object.keys(doneHashes || {}),
		backlinkQueue: backlinkQueue && backlinkQueue.size
			? [...backlinkQueue.values()]
			: undefined
	};
}

module.exports = { jobStateShape };
