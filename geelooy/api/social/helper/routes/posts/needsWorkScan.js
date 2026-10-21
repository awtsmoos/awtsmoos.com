//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module NeedsWorkScan
 * @description
 * Sibling of NeedsWorkRoutes: per-alias scan, relocated verbatim.
 */

const { GAP_PRIORITY } = require('./needsWorkConstants.js');
const { safeGetValue, safeKeys, aliasInfo, aliasHeichels, aliasSeriesIds } = require('./needsWorkDb.js');
const { detectPostGaps } = require('./needsWorkDetect.js');

/** Scans one alias. Returns the organized alias -> series -> post report. */
async function scanAlias($i, aliasId, options) {
	const info = await aliasInfo($i, aliasId);
	const include = options.include; // Set of gap names, or null for all
	const limit = options.limit;
	const summaryOnly = options.summaryOnly;

	const report = {
		aliasId,
		aliasName: info.name,
		postCount: 0,
		scannedCount: 0,
		truncated: false,
		gapCounts: {},
		series: {}
	};

	let heichels = await aliasHeichels($i, aliasId);
	if (options.heichel) heichels = heichels.filter(h => h === options.heichel);
	if (!heichels.length) {
		report.gapCounts.empty_alias_link = 1;
		report.emptyAliasLink = true;
		return report;
	}

	const bump = gap => { report.gapCounts[gap] = (report.gapCounts[gap] || 0) + 1; };
	const wanted = gap => !include || include.has(gap);

	for (const heichelId of heichels) {
		let seriesIds = await aliasSeriesIds($i, aliasId, heichelId);
		if (options.series) seriesIds = seriesIds.filter(s => s === options.series);
		for (const seriesId of seriesIds) {
			const postsPath = `${sp}/heichelos/${heichelId}/series/${seriesId}/posts`;
			const postIds = await safeKeys($i, postsPath);
			if (!postIds.length) continue;
			const seriesKey = `${heichelId}/${seriesId}`;
			const seriesReport = { heichelId, seriesId, postCount: postIds.length, items: [] };

			// Two passes: first collect raw detections, then apply series conventions.
			const raws = [];
			for (const postId of postIds) {
				if (report.scannedCount >= limit) { report.truncated = true; break; }
				const post = await safeGetValue($i, postsPath, postId);
				report.scannedCount++;
				if (!post || typeof post !== "object") continue;
				if (post.author && post.author !== aliasId) continue; // another alias's post
				report.postCount++;
				const first = detectPostGaps(post, { footnoteShare: 0, pageMarkerShare: 0, footnoteFieldSeen: false });
				raws.push({
					postId,
					title: post.title || postId,
					post,
					markerCount: first.markerCount,
					hasFootnotes: first.hasFootnotes,
					footnoteFieldSeen: post.footnotes !== undefined
				});
			}
			if (report.truncated) break;

			const withMarkers = raws.filter(r => r.markerCount > 0).length;
			const withFootnotes = raws.filter(r => r.hasFootnotes).length;
			const footnoteFieldSeen = raws.some(r => r.footnoteFieldSeen);
			const conventions = {
				pageMarkerShare: raws.length ? withMarkers / raws.length : 0,
				footnoteShare: raws.length ? withFootnotes / raws.length : 0,
				footnoteFieldSeen
			};

			for (const raw of raws) {
				const detected = detectPostGaps(raw.post, conventions);
				const gaps = detected.gaps.filter(wanted);
				for (const gap of gaps) bump(gap);
				if (gaps.length && !summaryOnly) {
					seriesReport.items.push({
						postId: raw.postId,
						title: raw.title,
						heichelId,
						seriesId,
						gaps,
						priority: Math.min(...gaps.map(g => GAP_PRIORITY[g] || 3)),
						detail: detected.detail
					});
				} else if (gaps.length && summaryOnly) {
					seriesReport.items.push({ postId: raw.postId, title: raw.title, gaps });
				}
			}
			seriesReport.items.sort((a, b) => (a.priority || 3) - (b.priority || 3));
			if (Object.keys(seriesReport.items).length || report.postCount) report.series[seriesKey] = seriesReport;
		}
		if (report.truncated) break;
	}
	return report;
}

module.exports = { scanAlias };
