// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SidebarCommentTree
 * @description Bounded browser transport for the dedicated native comment tree.
 */

export function whole(value) {
	return value == null || value === "" || value === "root" || value === "all";
}

export function unique(items) {
	return Array.from(new Set((items || []).filter(Boolean).map(String)));
}

export function aliasOf(comment) {
	return String(comment?.aliasId || comment?.author || "").trim();
}

export function flatten(rows = []) {
	const out = [];
	for (const row of rows) {
		out.push(row);
		out.push(...flatten(row.replies || []));
	}
	return out;
}

export function matchesSub(comment, sub) {
	if (sub == null || sub === "" || sub === "null") return true;
	return String(comment?.subsectionId ?? "") === String(sub);
}

function context() {
	return {
		heichelId: window.post?.heichel?.id || window.heichelId || "ikar",
		postId: window.post?.id || ""
	};
}

function treeUrl({ verse, offset = 0 }) {
	const current = context();
	const query = new URLSearchParams({
		offset: String(offset),
		limit: "100",
		maxDepth: "8",
		replyLimit: "100",
		_awt: String(Date.now())
	});
	if (!whole(verse)) {
		query.set("verseSection", String(verse));
	}
	return `/api/social/heichelos/${encodeURIComponent(current.heichelId)}/posts/${encodeURIComponent(current.postId)}/comment-tree?${query}`;
}

async function readPage(url) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 8000);
	try {
		const response = await fetch(url, {
			cache: "no-store",
			signal: controller.signal
		});
		if (!response.ok) {
			throw new Error(`Comment tree ${response.status}`);
		}
		return await response.json();
	} finally {
		clearTimeout(timer);
	}
}

export async function readTree(verse) {
	const rows = [];
	let offset = 0;
	for (let page = 0; page < 50; page++) {
		const report = await readPage(treeUrl({ verse, offset }));
		rows.push(...flatten(report?.success || []));
		if (!report?.meta?.hasMore) break;
		offset += 100;
	}
	return rows;
}
