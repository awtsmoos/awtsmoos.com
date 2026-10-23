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
		source: spec?.source,
		donePostIds: Object.keys(doneHashes || {}),
		backlinkQueue: backlinkQueue && backlinkQueue.size
			? [...backlinkQueue.values()]
			: undefined
	};
}

module.exports = { jobStateShape };
