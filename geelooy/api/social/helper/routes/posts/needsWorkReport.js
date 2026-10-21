//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module NeedsWorkReport
 * @description
 * Sibling of NeedsWorkRoutes: option parsing and the account report, relocated verbatim.
 */

const { er } = require('../../general.js');
const { GAP_LABEL } = require('./needsWorkConstants.js');
const { queryInt } = require('./needsWorkText.js');
const { userAliasIds } = require('./needsWorkDb.js');
const { scanAlias } = require('./needsWorkScan.js');
const { submittedUnapproved } = require('./needsWorkQueued.js');

function parseOptions($i) {
	const query = ($i && $i.$_GET) || {};
	const include = query.gaps
		? new Set(String(query.gaps).split(",").map(s => s.trim()).filter(Boolean))
		: null;
	return {
		limit: queryInt(query.limit, 400, 1, 2000),
		heichel: query.heichel ? String(query.heichel) : null,
		series: query.series ? String(query.series) : null,
		include,
		summaryOnly: String(query.summaryOnly || "") === "1"
	};
}

async function buildAccountReport($i, userid, options, onlyAliasId = null) {
	let aliasIds = await userAliasIds($i, userid);
	if (onlyAliasId) {
		if (!aliasIds.includes(onlyAliasId)) {
			return er({ code: "ALIAS_NOT_OWNED", message: "That alias does not belong to this account." });
		}
		aliasIds = [onlyAliasId];
	}

	const byAlias = {};
	const totals = { aliases: aliasIds.length, posts: 0, postsWithGaps: 0, byGap: {} };
	const topWork = [];
	const touchedHeichels = new Set();

	for (const aliasId of aliasIds) {
		const scanned = await scanAlias($i, aliasId, options);
		byAlias[aliasId] = scanned;
		totals.posts += scanned.postCount;
		for (const [gap, count] of Object.entries(scanned.gapCounts)) {
			totals.byGap[gap] = (totals.byGap[gap] || 0) + count;
		}
		for (const seriesReport of Object.values(scanned.series)) {
			touchedHeichels.add(seriesReport.heichelId);
			for (const item of seriesReport.items) {
				totals.postsWithGaps++;
				if (topWork.length < 200) {
					topWork.push({
						aliasId,
						aliasName: scanned.aliasName,
						heichelId: item.heichelId,
						seriesId: item.seriesId,
						postId: item.postId,
						title: item.title,
						gaps: item.gaps,
						gapLabels: item.gaps.map(g => GAP_LABEL[g] || g),
						priority: item.priority || 3
					});
				}
			}
		}
	}

	topWork.sort((a, b) => (a.priority - b.priority) || a.aliasName.localeCompare(b.aliasName));

	const queued = await submittedUnapproved($i, [...touchedHeichels], options.include);
	if (queued.length) {
		totals.byGap.submitted_unapproved = (totals.byGap.submitted_unapproved || 0) + queued.length;
		for (const item of queued) {
			if (topWork.length < 200) {
				topWork.push({
					aliasId: null,
					aliasName: null,
					heichelId: item.heichelId,
					seriesId: null,
					postId: item.postId,
					title: item.title,
					gaps: item.gaps,
					gapLabels: item.gaps.map(g => GAP_LABEL[g] || g),
					priority: item.priority
				});
			}
		}
		topWork.sort((a, b) => a.priority - b.priority);
	}

	const emptyAliases = Object.values(byAlias)
		.filter(a => a.emptyAliasLink)
		.map(a => ({ aliasId: a.aliasId, aliasName: a.aliasName }));

	return {
		ok: true,
		action: "posts.needsWork",
		scannedAt: new Date().toISOString(),
		account: { aliasCount: aliasIds.length },
		totals,
		byAlias,
		emptyAliases,
		submittedUnapproved: options.summaryOnly ? queued.length : queued,
		topWork: topWork.slice(0, 100),
		gapLabels: GAP_LABEL
	};
}

module.exports = {
	parseOptions,
	buildAccountReport
};
