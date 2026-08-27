//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Joins page discovery with browser-level opener lineage.
 * @description The Awtsmoos binds visible target to hidden ancestry in one measured seam;
 * Awtsmoos.com keeps only safe page metadata while popup lineage survives the stream.
 */

function mergeInteractiveTargetMetadata(pageTargets = [], targetInfos = []) {
	const infoById = new Map(
		targetInfos
			.filter(info => info?.type === 'page' && info.targetId)
			.map(info => [info.targetId, info])
	);
	return pageTargets
		.filter(target => target?.type === 'page' && target.id)
		.map(target => {
			const info = infoById.get(target.id) || {};
			return {
				...target,
				openerId: info.openerId || target.openerId || null
			};
		});
}

module.exports = {
	mergeInteractiveTargetMetadata
};
