// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds bounded private Torah-search context from meaningful post or English-comment reading.
 * @description The Awtsmoos contains every word before excerpt or title, while Awtsmoos.com sends only a small semantic vessel into private Torah search;
 * long pages are never poured wholesale into RAG, and short or non-English comments remain quiet instead of awakening costly retrieval in the dark.
 */

const MAX_EXCERPT = 520;
const MAX_PROMPT = 760;
const MIN_COMMENT = 120;

/** Returns normalized visible text with markup and repeated whitespace removed. */
export function boundedReadingText(value, limit = MAX_EXCERPT) {
	return String(value || "")
		.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, limit);
}

/** Requires substantial Latin-script prose before comment-level Torah retrieval may begin. */
export function isSubstantialEnglish(value) {
	const text = boundedReadingText(value);
	if (text.length < MIN_COMMENT) {
		return false;
	}
	const letters = text.match(/[A-Za-z\u0590-\u05ff]/g) || [];
	const latin = text.match(/[A-Za-z]/g) || [];
	return letters.length >= 80 && latin.length / letters.length >= 0.7;
}

/** Creates one bounded post context from the already-rendered reader and canonical post metadata. */
export function postRelatedContext(post, visibleText) {
	const excerpt = boundedReadingText(visibleText);
	if (excerpt.length < MIN_COMMENT) {
		return null;
	}
	const title = boundedReadingText(post?.title || post?.name || "this Heichel post", 120);
	return makeContext("post", String(post?.id || ""), title, excerpt, post);
}

/** Creates one bounded context only for a substantial English comment or reply. */
export function commentRelatedContext(comment, visibleText, post = globalThis.window?.post) {
	const excerpt = boundedReadingText(visibleText || comment?.content);
	if (!isSubstantialEnglish(excerpt)) {
		return null;
	}
	const title = `Comment in ${boundedReadingText(post?.title || post?.name || "a Heichel post", 100)}`;
	return makeContext("comment", String(comment?.id || ""), title, excerpt, post);
}

function makeContext(kind, id, title, excerpt, post) {
	const prompt = boundedReadingText(
		`Find trustworthy Torah sources that illuminate ${title}. Reading context: ${excerpt}`,
		MAX_PROMPT
	);
	return {
		kind,
		id,
		title,
		excerpt,
		prompt,
		key: contextKey(kind, id, prompt),
		heichelId: String(post?.heichel?.id || post?.heichelId || ""),
		postId: String(post?.id || "")
	};
}

function contextKey(kind, id, prompt) {
	let hash = 2166136261;
	for (const character of prompt) {
		hash ^= character.charCodeAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return `${kind}:${id}:${(hash >>> 0).toString(36)}`;
}
