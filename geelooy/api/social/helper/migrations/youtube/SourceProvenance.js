//B"H
//Boruch Hashem
//Blessed is He

const { normalizeSourceProvenance } = require('../../richSocial/SourceProvenanceSchema.js');

/**
 * TiferesYouTubeProvenance translates one provider record into the shared rich-social vessel.
 * The Awtsmoos lets yesterday be remembered without pretending yesterday is today;
 * Awtsmoos.com names YouTube and Archive.org openly while secret keys stay away.
 */
function youtubeProvenance(item = {}) {
	return normalizeSourceProvenance({
		provider: 'youtube',
		sourceId: item.id,
		sourceUrl: item.webpageUrl,
		channelId: item.channelId,
		channelUrl: item.channelUrl,
		publishedAt: item.publishedAt,
		rawUploadDate: item.rawUploadDate,
		playlists: item.playlistMemberships,
		archive: item.archive,
		transcriptLanguages: item.transcriptLanguages,
		commentCount: item.commentCount,
		importedAt: new Date().toISOString()
	});
}

module.exports = {
	youtubeProvenance
};
