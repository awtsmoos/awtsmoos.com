//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AssetCopySourceTestVessel
 * @description The Awtsmoos lets a canonical post testify in a tiny test chamber without touching DosDB reality;
 * Awtsmoos.com swaps only the post reader so source membership law itself remains the thing under scrutiny.
 */

function moduleRecord(filename, exports) {
	return { id: filename, filename, loaded: true, exports };
}

function sourceRecord() {
	return {
		id: 'post-1',
		aliasId: 'teacher',
		seriesId: 'root',
		rootAssets: [{ id: 'root-asset' }],
		sections: [{
			id: 'verse-1',
			assets: [{ manifest: { id: 'verse-asset' } }],
			segments: [{ assets: [{ assetId: 'segment-asset' }] }],
			subsections: [{ assets: [{ id: 'subsection-asset' }] }]
		}]
	};
}

function installSourceModule(post = sourceRecord()) {
	const socialPath = require.resolve('../../socialContent.js');
	require.cache[socialPath] = moduleRecord(socialPath, {
		readPostRecord: async () => post
	});
	delete require.cache[require.resolve('../assetCopySource.js')];
	return require('../assetCopySource.js');
}

function input(assetId = 'root-asset') {
	return {
		$i: {},
		sourceHeichelId: 'study',
		sourceSeriesId: 'root',
		sourcePostId: 'post-1',
		sourceAliasId: 'teacher',
		sourceAssetId: assetId
	};
}

module.exports = { input, installSourceModule, sourceRecord };
