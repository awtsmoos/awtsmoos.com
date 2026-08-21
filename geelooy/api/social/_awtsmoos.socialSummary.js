// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialSummaryRoutes
 * @description
 * The Awtsmoos lets public social consequence be read without granting impersonation; Awtsmoos.com keeps
 * GET identity in the query vessel and POST identity in the body vessel so stale parameters never compete for meaning.
 */
const { er } = require('./helper/general.js');
const { summarizeSocial } = require('./helper/socialSummary/SocialSummary.js');
const { summarizeBatch, MAX_TARGETS } = require('./helper/socialSummary/SocialSummaryBatch.js');
const { verifiedViewerAlias } = require('./helper/socialSummary/SocialSummaryViewer.js');

function queryTarget($i) {
	const query = $i.$_GET || {};
	return {
		type: query.type,
		id: query.id || query.postId,
		heichelId: query.heichelId,
		seriesId: query.seriesId || 'root'
	};
}

function parseTargets($i) {
	const raw = $i.$_POST?.targets;
	if (Array.isArray(raw)) return raw;
	if (typeof raw !== 'string') return [];
	try {
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function requestedViewerAlias($i) {
	return $i.request.method === 'POST'
		? String($i.$_POST?.viewerAliasId || '')
		: String($i.$_GET?.viewerAliasId || '');
}

async function viewerAlias({ $i, userid }) {
	return verifiedViewerAlias({
		$i,
		userid,
		requestedAliasId: requestedViewerAlias($i)
	});
}

function ok(data, extra = {}) {
	return {
		BH: 'B"H',
		ok: true,
		data,
		success: data,
		meta: { version: '1.0', ...extra }
	};
}

module.exports = ({ $i, userid } = {}) => ({
	'/social-summary': async () => {
		if ($i.request.method !== 'GET') return er({ code: 'BAD_METHOD', message: 'Use GET.' });
		const summary = await summarizeSocial({
			$i,
			target: queryTarget($i),
			viewerAliasId: await viewerAlias({ $i, userid })
		});
		return summary
			? ok(summary)
			: er({ code: 'BAD_TARGET', message: 'A measurable social target is required.' });
	},
	'/social-summary/batch': async () => {
		if ($i.request.method !== 'POST') return er({ code: 'BAD_METHOD', message: 'Use POST.' });
		const targets = parseTargets($i);
		if (!targets.length) return er({ code: 'BAD_TARGETS', message: 'Provide a non-empty targets array.' });
		const summaries = await summarizeBatch({
			$i,
			targets,
			viewerAliasId: await viewerAlias({ $i, userid })
		});
		return ok(summaries, {
			requested: targets.length,
			returned: summaries.length,
			maxTargets: MAX_TARGETS
		});
	}
});

module.exports.parseTargets = parseTargets;
module.exports.queryTarget = queryTarget;
module.exports.requestedViewerAlias = requestedViewerAlias;
