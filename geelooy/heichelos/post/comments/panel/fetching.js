// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SidebarCommentFetching
 * @description Sidebar caches and filters comments read from the dedicated tree transport.
 */
import { data, getInlineAliases } from "../state.js";
import {
	aliasOf,
	matchesSub,
	readTree,
	unique,
	whole
} from "./tree.js";

function cacheKey(verse) {
	return whole(verse) ? "all-scroll" : `${verse}-verse-all`;
}

export async function getAndSaveAliases(
	full = false,
	fresh = false,
	forcedIdx = null,
	forcedSub = undefined
) {
	if (!window.post?.heichel) return [];
	const params = new URLSearchParams(location.search);
	const verse = forcedIdx !== null ? forcedIdx : params.get("idx");
	const sub = forcedSub !== undefined ? forcedSub : params.get("sub");
	const key = cacheKey(verse);
	if (!fresh && data.aliases?.[key]) {
		return data.aliases[key].aliases;
	}
	let rows = [];
	try {
		rows = await readTree(verse);
	} catch (error) {
		console.warn("B\"H sidebar comment tree resisted", error);
	}
	const aliases = unique([
		...rows.filter(row => matchesSub(row, sub)).map(aliasOf),
		...getInlineAliases()
	]);
	if (!data.aliases) data.aliases = {};
	data.aliases[key] = {
		aliases,
		lastModified: Date.now()
	};
	return aliases;
}

export async function fetchRelevantComments(
	alias,
	verse,
	sub,
	fresh = false
) {
	const key = `${alias}:${cacheKey(verse)}:${sub ?? "all"}`;
	if (!fresh && data.commentCache?.[key]) {
		return data.commentCache[key];
	}
	let rows = [];
	try {
		rows = await readTree(verse);
	} catch (error) {
		console.warn("B\"H sidebar comments resisted", error);
	}
	const filtered = rows.filter(row => (
		aliasOf(row) === String(alias) && matchesSub(row, sub)
	));
	if (!data.commentCache) data.commentCache = {};
	data.commentCache[key] = filtered;
	return filtered;
}

export function clearSidebarCommentCache() {
	data.commentCache = {};
	data.aliases = {};
}
