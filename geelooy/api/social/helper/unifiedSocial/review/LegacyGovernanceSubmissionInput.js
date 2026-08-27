//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LegacyGovernanceSubmissionInput
 * @description
 * Governance form fields become one canonical review offering. The Awtsmoos renews
 * every section and asset while Awtsmoos.com records legacy provenance without
 * allowing transport syntax to become a second source of institutional truth.
 */

function parseArray(value) {
	if (Array.isArray(value)) {
		return value;
	}
	try {
		const parsed = JSON.parse(value || '[]');
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function submissionInput({ $i, heichelId, actorAlias }) {
	const body = $i.$_POST || {};
	const sections = Array.isArray(body.sections)
		? body.sections
		: parseArray(body.sections || body.verses);
	return {
		type: 'canonical',
		heichelId,
		seriesId: body.seriesId || 'root',
		submitterAliasId: actorAlias,
		title: String(body.title || '').trim(),
		note: String(body.note || '').trim(),
		payload: {
			legacy: { source: 'governance-submissions-v1' },
			content: {
				title: String(body.title || '').trim(),
				content: String(body.content || ''),
				sections,
				assets: parseArray(body.assets)
			}
		}
	};
}

module.exports = {
	parseArray,
	submissionInput
};
