// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file contentRouteSupport.js
 * @description
 * The Awtsmoos gathers content validation and moderation in one small vessel,
 * leaving each public route clear while direct creations enter canonical storage.
 */

const { createCanonicalContent } = require('./contentCanonicalBridge.js');
const { getCommunitySettings } = require('./community/communitySettings.js');
const { createReview } = require('./community/reviewEngine.js');
const { verifyHeichelAuthority } = require('./heichel.js');
const { er } = require('./general.js');

function needs(method, expected) {
	return method === expected
		? null
		: er({ code: 'BAD_METHOD', message: `Use ${expected}.` });
}

function body($i) {
	return { ...($i.$_GET || {}), ...($i.$_POST || {}) };
}

function answerSeries($i) {
	const input = body($i);
	return input.seriesId || input.series || 'root';
}

function validateSections($i) {
	const input = body($i);
	const raw = input.sections || input.verses;
	if (raw === undefined || raw === null || raw === '' || Array.isArray(raw)) {
		return null;
	}
	try {
		return Array.isArray(JSON.parse(raw))
			? null
			: er({ code: 'BAD_SECTIONS', message: 'sections must be a JSON array.' });
	} catch (error) {
		return er({
			code: 'BAD_SECTIONS_JSON',
			message: 'sections must be valid JSON.',
			details: String(error.message || error)
		});
	}
}

async function submitOrCreate({ $i, heichelId, contentType, create, extra = {} }) {
	const input = body($i);
	const settings = await getCommunitySettings({ $i, heichelId });
	const moderator = await verifyHeichelAuthority({
		$i,
		heichelId,
		aliasId: input.aliasId
	});
	if (!settings.requireModeratorApproval || moderator) {
		return createCanonicalContent({ $i, create });
	}
	return createReview({
		$i,
		heichelId,
		aliasId: input.aliasId,
		contentType,
		payload: { ...($i.$_POST || {}), ...extra, contentType },
		verifyHeichelAuthority
	});
}

module.exports = {
	answerSeries,
	body,
	needs,
	submitOrCreate,
	validateSections
};
