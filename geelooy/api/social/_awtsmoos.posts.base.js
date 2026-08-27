// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialPostsRoutes
 * @description
 * The Awtsmoos guides ordinary, virtual, and restored Meluket series through
 * focused readers, so every Awtsmoos.com route reveals the same living posts.
 */

const {
	addPostToSeries,
	approveSubmittedPost,
	deletePostFromSeries,
	denySubmittedPost,
	editPostInSeries,
	er,
	getHeichelosOfPostsOfAlias,
	getPostFromSeries,
	getPostsByProperty,
	getPostsInSeries,
	getPostsOfAliasInSeries,
	getSeriesOfPostsOfAliasInHeichel,
	getSubmittedPosts
} = require("./helper/index.js");
const {
	installSocialDbBridge
} = require("./helper/packed/socialDbBridgeInstaller.js");
const {
	readPostCompatible,
	readPostsCompatible
} = require("./helper/post/seriesReadCompatibility.js");
const {
	getVirtualPostFromSeries,
	getVirtualPostsInSeries
} = require("./helper/series/virtualSeries.js");

function decodeCrumbPath(value = "") {
	try {
		return decodeURIComponent(Buffer.from(value, "base64").toString("utf-8"));
	} catch (_error) {
		return "";
	}
}

function parseMap(value) {
	if (!value) return null;
	if (typeof value === "object") return value;
	try {
		return JSON.parse(value);
	} catch (_error) {
		return null;
	}
}

function properties($i) {
	return parseMap($i.$_GET?.properties || $i.$_GET?.propertyMap);
}

function detailsRequested($i) {
	return $i.$_GET?.details === true || $i.$_GET?.details === "true";
}

async function readPostsRoute({ $i, heichelId, seriesId, withDetails }) {
	const selected = properties($i);
	const virtual = await getVirtualPostsInSeries({
		$i,
		heichelId,
		seriesId,
		withDetails,
		properties: selected
	});
	if (virtual) return virtual;
	return readPostsCompatible({
		$i,
		heichelId,
		seriesId,
		withDetails,
		properties: selected,
		standardReader: () => getPostsInSeries({
			$i,
			heichelId,
			seriesId,
			withDetails,
			properties: selected
		})
	});
}

async function readPostRoute({ $i, heichelId, seriesId, postId }) {
	const selected = properties($i);
	const virtual = await getVirtualPostFromSeries({
		$i,
		heichelId,
		seriesId,
		postId,
		properties: selected
	});
	if (virtual) return virtual;
	return readPostCompatible({
		$i,
		heichelId,
		seriesId,
		postId,
		properties: selected,
		standardReader: () => getPostFromSeries({
			$i,
			heichelId,
			seriesId,
			postId
		})
	});
}

module.exports = ({ $i, userid } = {}) => {
	installSocialDbBridge($i);
	return {
		"/aliases/:alias/postsMade/heichel/:heichel/pathToSeries/:pathive": async vars => {
			return getPostsOfAliasInSeries({
				$i,
				aliasId: vars.alias,
				crumbpath: decodeCrumbPath(vars.pathive),
				heichelId: vars.heichel,
				withDetails: true
			});
		},
		"/aliases/:alias/postsMade/heichelos": async vars => {
			return getHeichelosOfPostsOfAlias({ $i, aliasId: vars.alias });
		},
		"/aliases/:alias/postsMade/heichel/:heichel/series": async vars => {
			return getSeriesOfPostsOfAliasInHeichel({
				$i,
				aliasId: vars.alias,
				heichelId: vars.heichel
			});
		},
		"/heichelos/:heichel/submittedPosts": async vars => {
			if ($i.request.method !== "GET") return er({ code: "METHOD_NOT_ALLOWED" });
			return getSubmittedPosts({ $i, heichelId: vars.heichel });
		},
		"/heichelos/:heichel/submittedPosts/approve": async vars => {
			if ($i.request.method !== "POST") return er({ code: "METHOD_NOT_ALLOWED" });
			return approveSubmittedPost({
				$i,
				heichelId: vars.heichel,
				postId: $i.$_POST.postId,
				approverAliasId: $i.$_POST.aliasId,
				addPostToSeries
			});
		},
		"/heichelos/:heichel/submittedPosts/deny": async vars => {
			if (!["POST", "DELETE"].includes($i.request.method)) {
				return er({ code: "METHOD_NOT_ALLOWED" });
			}
			const body = $i.$_POST || $i.$_DELETE || {};
			return denySubmittedPost({
				$i,
				heichelId: vars.heichel,
				postId: body.postId,
				approverAliasId: body.aliasId
			});
		},
		"/heichelos/:heichel/series/:series/posts": async vars => {
			if ($i.request.method === "GET") {
				return readPostsRoute({
					$i,
					heichelId: vars.heichel,
					seriesId: vars.series,
					withDetails: detailsRequested($i)
				});
			}
			if ($i.request.method !== "POST") return er({ code: "METHOD_NOT_ALLOWED" });
			$i.$_POST.seriesId = vars.series;
			return addPostToSeries({
				$i,
				heichelId: vars.heichel,
				seriesId: vars.series
			});
		},
		"/heichelos/:heichel/series/:series/posts/details": async vars => {
			if ($i.request.method !== "GET") return er({ code: "METHOD_NOT_ALLOWED" });
			return readPostsRoute({
				$i,
				heichelId: vars.heichel,
				seriesId: vars.series,
				withDetails: true
			});
		},
		"/heichelos/:heichel/series/:series/post/:post": async vars => {
			if ($i.request.method === "GET") {
				return readPostRoute({
					$i,
					heichelId: vars.heichel,
					seriesId: vars.series,
					postId: vars.post
				});
			}
			if ($i.request.method === "PUT") {
				return editPostInSeries({
					$i,
					heichelId: vars.heichel,
					seriesId: vars.series,
					postId: vars.post
				});
			}
			if ($i.request.method !== "DELETE") return er({ code: "METHOD_NOT_ALLOWED" });
			if (!$i.$_DELETE) $i.$_DELETE = {};
			$i.$_DELETE.aliasId = $i.$_DELETE.aliasId
				|| $i.$_QUERY?.aliasId
				|| $i.$_GET?.aliasId;
			if (!$i.$_DELETE.aliasId) return er({ code: "AUTH_NEEDED" });
			return deletePostFromSeries({
				$i,
				heichelId: vars.heichel,
				seriesId: vars.series,
				postId: vars.post,
				userid
			});
		},
		"/heichelos/:heichel/series/:series/post/:post/delete": async vars => {
			return deletePostFromSeries({
				$i,
				heichelId: vars.heichel,
				seriesId: vars.series,
				postId: vars.post,
				userid
			});
		},
		"/heichelos/:heichel/series/:series/filterPostsBy/:propKey/:propVal": async vars => {
			if ($i.request.method !== "GET") return er({ code: "METHOD_NOT_ALLOWED" });
			return getPostsByProperty({
				$i,
				heichelId: vars.heichel,
				seriesId: vars.series,
				propertyKey: decodeURIComponent(vars.propKey || ""),
				propertyValue: decodeURIComponent(vars.propVal || "")
			});
		}
	};
};
