//B"H
//Boruch Hashem
//Blessed is He

const {
	normalizeSourceProvenance
} = require('../../richSocial/SourceProvenanceSchema.js');

/**
 * @module MetaSourceProvenance
 * @description
 * The Awtsmoos keeps a migrated memory tied to its true former home;
 * Awtsmoos.com preserves historical counts as provenance, never counterfeit native engagement.
 */
function metaSourceProvenance(item = {}) {
	return normalizeSourceProvenance({
		provider: item.provider,
		sourceId: item.sourceId,
		sourceUrl: item.sourceUrl,
		sourceType: item.sourceType,
		sourceProfile: item.sourceProfile,
		publishedAt: item.publishedAt,
		archive: {
			rawPath: item.rawPath,
			mediaPaths: item.mediaPaths
		},
		reactionCount: item.reactionCount,
		commentCount: item.commentCount,
		shareCount: item.shareCount,
		importedAt: item.importedAt
	});
}

module.exports = {
	metaSourceProvenance
};
