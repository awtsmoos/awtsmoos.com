// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds truthful metadata and routes for one social VFS node.
 * @description
 * The Awtsmoos lets a post carry View, Revision, Creation, and identity without confusion;
 * Awtsmoos.com keeps route knowledge outside the filesystem adapter so each vessel has one mission.
 */

/** @param {object} item Social tree item. @param {string} aliasId Mounted alias. */
export function socialHeichelDescriptor(item, aliasId) {
	const source = item.source || {};
	const heichelId = source.heichelId || (item.kind === "heichel" ? item.id : "");
	const seriesId = source.seriesId || (item.kind === "series" ? item.id : "root");
	const postId = source.postId || source.id || (item.kind === "post" ? item.id : "");
	const viewUrl = viewRoute(item, aliasId, heichelId, seriesId, postId);
	return {
		aliasId,
		heichelId,
		seriesId,
		postId,
		viewUrl,
		revisionUrl: postId
			? revisionRoute(aliasId, heichelId, seriesId, postId, viewUrl)
			: "",
		composeUrl: composeRoute(aliasId, heichelId, seriesId),
		canDirectEdit: false,
		directEditReason: "The current editor contract saves and publishes drafts but does not expose a proven existing-post mutation route.",
		title: item.name,
		summary: source.excerpt || source.summary || source.description || ""
	};
}

function viewRoute(item, aliasId, heichelId, seriesId, postId) {
	if (postId && heichelId) {
		return `/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId || "root")}/${encodeURIComponent(postId)}`;
	}
	return item.kind === "heichel"
		? `/heichelos/${encodeURIComponent(item.id)}`
		: `/@${encodeURIComponent(aliasId)}`;
}

function revisionRoute(aliasId, heichelId, seriesId, postId, returnPath) {
	const params = new URLSearchParams({
		alias: aliasId,
		heichel: heichelId,
		series: seriesId || "root",
		source: postId,
		sourceType: "post",
		sourceHeichel: heichelId,
		sourceSeries: seriesId || "root",
		sourceAlias: aliasId,
		return: returnPath
	});
	return `/social-composer?${params.toString()}`;
}

function composeRoute(aliasId, heichelId, seriesId) {
	const params = new URLSearchParams({
		alias: aliasId,
		series: seriesId || "root"
	});
	if (heichelId) {
		params.set("heichel", heichelId);
	}
	return `/social-composer?${params.toString()}`;
}
