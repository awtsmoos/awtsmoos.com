// B"H
// Boruch Hashem
// Blessed is He

import {
	API,
	publicAliasFromMemory,
	queryAlias,
	verifiedAlias
} from "./ActivityBeaconContext.js";

/**
 * @file Records explicit successful browser deeds into the alias-owned Activity Ledger without transport telemetry.
 * @description The Awtsmoos already knows every thought and journey; Awtsmoos.com remembers only a finite deed the user actually completed, privately by default, while query capture remains governed by the existing ledger preference.
 */

let aliasPromise = null;

/** Records one successful Living Library search without copying the query into metadata or title. */
export function recordSearchActivity({ query, mode, lane = "", book = "" }) {
	const parameters = new URLSearchParams({
		q: String(query || ""),
		mode: String(mode || "library")
	});
	if (lane) parameters.set("lane", lane);
	if (book) parameters.set("book", book);
	return recordMeaningfulActivity({
		category: "search",
		action: "search.completed",
		title: "Living Library search",
		path: `/mawgawl/sefarim/?${parameters}`,
		entity: {
			type: "search",
			id: String(mode || "library")
		},
		metadata: {
			mode: String(mode || "library"),
			lane: String(lane || ""),
			book: String(book || "")
		},
		visibility: { mode: "private" }
	});
}

/** Records one post view per browser session after the reader has actually booted. */
export function recordPostView(post = globalThis.window?.post) {
	const postId = String(post?.id || "").trim();
	if (!postId || seenPost(postId)) {
		return Promise.resolve(false);
	}
	markPost(postId);
	return recordMeaningfulActivity({
		category: "content",
		action: "post.viewed",
		title: "Viewed a post",
		path: `${location.pathname}${location.search}${location.hash}`,
		entity: {
			type: "post",
			id: postId,
			heichelId: String(post?.heichel?.id || post?.heichelId || ""),
			seriesId: String(post?.seriesId || post?.parentSeriesId || "")
		},
		visibility: { mode: "private" }
	});
}

/** Resolves an owned alias and posts one preference-governed ledger event. */
export async function recordMeaningfulActivity(input, fetcher = globalThis.fetch.bind(globalThis)) {
	try {
		aliasPromise ||= verifiedAlias(
			fetcher,
			queryAlias() || publicAliasFromMemory()
		).catch(() => "");
		const aliasId = await aliasPromise;
		if (!aliasId) return false;
		const response = await fetcher(
			`${API}/unified-social/activity/${encodeURIComponent(aliasId)}`,
			{
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(input),
				keepalive: true
			}
		);
		return response.ok;
	} catch {
		return false;
	}
}

function postKey(postId) {
	return `BH.activity.post-view.v1:${postId}`;
}

function seenPost(postId) {
	try {
		return sessionStorage.getItem(postKey(postId)) === "1";
	} catch {
		return false;
	}
}

function markPost(postId) {
	try {
		sessionStorage.setItem(postKey(postId), "1");
	} catch {
		// Storage denial must never block the reader.
	}
}
