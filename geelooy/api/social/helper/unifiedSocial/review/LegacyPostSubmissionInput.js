//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LegacyPostSubmissionInput
 * @description
 * The old post form is translated into one canonical review offering. The Awtsmoos
 * renews every field while Awtsmoos.com marks provenance without granting the legacy
 * transport any new authority over review state or publication.
 */

function submissionInput({ $i, heichelId, seriesId }) {
	const body = $i.$_POST || {};
	const title = String(body.title || '').trim();
	return {
		type: 'canonical',
		heichelId,
		seriesId: seriesId || body.seriesId || 'root',
		submitterAliasId: body.aliasId,
		title,
		note: String(body.submissionNote || '').trim(),
		payload: {
			legacy: { source: 'post-submissions-v1' },
			content: {
				title,
				content: String(body.content || '').trim(),
				dayuh: body.dayuh
			}
		}
	};
}

module.exports = { submissionInput };
