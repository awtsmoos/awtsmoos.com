// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialSeriesCompatibilityRoutes
 * @description
 * The Awtsmoos keeps ancient series vessels and restored Meluket months aligned,
 * so Awtsmoos.com series details report every mapped post identity.
 */

const createBaseRoutes = require("./_awtsmoos.series.base.js");
const {
	addPostToSeries,
	changeSubSeriesFromOneSeriesToAnother,
	deletePostFromSeries,
	deleteSeriesFromHeichel,
	editSeriesDetails,
	editSubSeriesInSeries,
	er,
	getSeries,
	getSubSeries,
	makeNewSeries
} = require("./helper/index.js");
const {
	idsForSeries
} = require("./helper/post/meluketSeriesMap.js");
const {
	getAlternateGroups
} = require("./helper/series/virtualSeries.js");

function body($i) {
	return $i.$_POST || $i.$_PUT || $i.$_DELETE || {};
}

function alias($i) {
	return body($i).aliasId || $i.$_GET?.aliasId;
}

function ids(value) {
	if (Array.isArray(value)) return value;
	return String(value || "").split(",").filter(Boolean);
}

function parent($i) {
	return body($i).parentSeriesId
		|| body($i).seriesId
		|| $i.$_GET?.parentSeriesId
		|| "root";
}

function isPostLike($i) {
	const input = body($i);
	return Boolean(
		input.postId
		|| input.title
		|| input.content
		|| input.dayuh
		|| input.type === "post"
	);
}

async function seriesDetails($i, heichelId, seriesId = "root") {
	const result = await getSeries({
		$i,
		heichelId,
		seriesId,
		withDetails: true
	});
	const mappedIds = idsForSeries($i, seriesId);
	if (mappedIds.length && result && !result.error) result.posts = mappedIds;
	return result;
}

function subSeries($i, heichelId, seriesId = "root", withDetails = false) {
	return getSubSeries({
		$i,
		heichelId,
		parentSeriesId: seriesId,
		withDetails
	});
}

function deleteSeriesCompat($i, heichelId, seriesId, parentSeriesId = "root") {
	return deleteSeriesFromHeichel({
		$i,
		heichelId,
		seriesId,
		parentSeriesId,
		userid: $i.userid
	});
}

function addContent($i, heichelId) {
	if (!$i.$_POST) $i.$_POST = {};
	$i.$_POST.parentSeriesId = parent($i);
	$i.$_POST.seriesId = $i.$_POST.seriesId || $i.$_POST.parentSeriesId;
	if (isPostLike($i)) {
		return addPostToSeries({
			$i,
			heichelId,
			seriesId: $i.$_POST.seriesId
		});
	}
	return makeNewSeries({ $i, heichelId });
}

function deleteContent($i, heichelId) {
	const input = body($i);
	const parentSeriesId = input.parentSeriesId || input.seriesId || "root";
	if (input.postId || input.type === "post") {
		return deletePostFromSeries({
			$i,
			heichelId,
			seriesId: parentSeriesId,
			postId: input.postId,
			userid: $i.userid
		});
	}
	return deleteSeriesCompat(
		$i,
		heichelId,
		input.subSeriesId || input.seriesId || input.id,
		parentSeriesId
	);
}

module.exports = ({ $i, userid } = {}) => {
	const base = createBaseRoutes({ $i, userid });
	return {
		...base,
		"/heichelos/:heichel/series/:series": async vars => {
			if ($i.request.method !== "GET") {
				return base["/heichelos/:heichel/series/:series"](vars);
			}
			if ($i.$_GET?.details === true || $i.$_GET?.details === "true") {
				return seriesDetails($i, vars.heichel, vars.series);
			}
			return base["/heichelos/:heichel/series/:series"](vars);
		},
		"/heichelos/:heichel/series/:series/details": async vars => {
			if ($i.request.method === "GET") {
				return seriesDetails($i, vars.heichel, vars.series);
			}
			return base["/heichelos/:heichel/series/:series/details"](vars);
		},
		"/heichelos/:heichel/series/details": async vars => {
			return seriesDetails($i, vars.heichel, "root");
		},
		"/heichelos/:heichel/series/root": async vars => {
			return seriesDetails($i, vars.heichel, "root");
		},
		"/heichelos/:heichel/series/root/details": async vars => {
			return seriesDetails($i, vars.heichel, "root");
		},
		"/heichelos/:heichel/series/root/subSeries": async vars => {
			const details = $i.$_GET?.details === true || $i.$_GET?.details === "true";
			return subSeries($i, vars.heichel, "root", details);
		},
		"/heichelos/:heichel/series/root/subSeries/details": async vars => {
			return subSeries($i, vars.heichel, "root", true);
		},
		"/heichelos/:heichel/series/root/breadcrumb": async () => {
			return [{ id: "root", name: "Root" }];
		},
		"/heichelos/:heichel/series/:series/alternateGroups": async vars => {
			return getAlternateGroups({
				$i,
				heichelId: vars.heichel,
				seriesId: vars.series,
				withDetails: true
			});
		},
		"/heichelos/:heichel/series/:series/alternateGroups/details": async vars => {
			return getAlternateGroups({
				$i,
				heichelId: vars.heichel,
				seriesId: vars.series,
				withDetails: true
			});
		},
		"/heichelos/:heichel/addContentToSeries": async vars => {
			if ($i.request.method !== "POST") return er({ code: "METHOD_NOT_ALLOWED" });
			return addContent($i, vars.heichel);
		},
		"/heichelos/:heichel/deleteContentFromSeries": async vars => {
			return deleteContent($i, vars.heichel);
		},
		"/heichelos/:heichel/deleteSeriesFromHeichel/:seriesId": async vars => {
			return deleteSeriesCompat(
				$i,
				vars.heichel,
				vars.seriesId,
				$i.$_GET?.parentSeriesId || body($i).parentSeriesId || "root"
			);
		},
		"/heichelos/:heichel/series/:series/editSeriesDetails": async vars => {
			return editSeriesDetails({
				$i,
				heichelId: vars.heichel,
				seriesId: vars.series
			});
		},
		"/heichelos/:heichel/series/:series/changePostsInSeries": async vars => {
			return {
				success: {
					kept: true,
					route: "compat",
					seriesId: vars.series,
					postIds: ids(body($i).postIDs || body($i).postIds)
				}
			};
		},
		"/heichelos/:heichel/series/:series/changeSubSeriesInSeries": async vars => {
			return editSubSeriesInSeries({
				$i,
				heichelId: vars.heichel,
				seriesId: vars.series,
				aliasId: alias($i)
			});
		},
		"/heichelos/:heichel/series/:seriesFrom/changeSubSeriesFromOneSeriesToAnother/:seriesTo": async vars => {
			return changeSubSeriesFromOneSeriesToAnother({
				$i,
				heichelId: vars.heichel,
				seriesFrom: vars.seriesFrom,
				seriesTo: vars.seriesTo,
				aliasId: alias($i)
			});
		}
	};
};
