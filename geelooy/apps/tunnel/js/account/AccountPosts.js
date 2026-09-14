// B"H
// Boruch Hashem
// Blessed is He

import { accountFetch, accountForm } from "./AccountFetch.js";

/**
 * @file Gives the authenticated browser tunnel complete canonical post CRUD.
 * @description The Awtsmoos renews author, post, series, and heichel as one truth;
 * Awtsmoos.com sends mutations through existing Social authorization so the tunnel
 * receives the user's real capabilities without acquiring an authorization bypass.
 */

/** Lists detailed posts in one canonical heichel series. */
export function accountPostsList(input = {}) {
	return accountFetch(postCollectionPath(input, true));
}

/** Reads one canonical post from its heichel and series identity. */
export function accountPostGet(input = {}) {
	return accountFetch(postPath(input));
}

/** Creates one post using the current user's chosen authorized alias. */
export function accountPostCreate(input = {}) {
	const heichelId = required(input.heichelId, "heichelId");
	return accountForm(
		`/api/social/content/heichelos/${encodeURIComponent(heichelId)}/posts`,
		postFields(input)
	);
}

/** Updates one existing post through the canonical singular-post mutation route. */
export function accountPostUpdate(input = {}) {
	return accountForm(postPath(input), postFields(input), "PUT");
}

/** Deletes one post only through the existing Social authorization boundary. */
export function accountPostDelete(input = {}) {
	return accountForm(postPath(input), {
		aliasId: required(input.aliasId, "aliasId")
	}, "DELETE");
}

function postCollectionPath(input, details = false) {
	const heichelId = required(input.heichelId, "heichelId");
	const seriesId = String(input.seriesId || "root");
	const suffix = details ? "/details" : "";
	return `/api/social/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}/posts${suffix}`;
}

function postPath(input) {
	const heichelId = required(input.heichelId, "heichelId");
	const seriesId = String(input.seriesId || "root");
	const postId = required(input.postId || input.id, "postId");
	return `/api/social/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}/post/${encodeURIComponent(postId)}`;
}

function postFields(input) {
	return {
		aliasId: required(input.aliasId, "aliasId"),
		postId: input.postId,
		title: required(input.title, "title"),
		content: input.content ?? "",
		seriesId: input.seriesId || "root",
		sections: input.sections || [],
		rootAssets: input.rootAssets || []
	};
}

function required(value, field) {
	const text = String(value || "").trim();
	if (!text) throw new Error(`account_${field}_required`);
	return text;
}
