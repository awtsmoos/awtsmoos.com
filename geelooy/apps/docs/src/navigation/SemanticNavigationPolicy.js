// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defines bounded target identities for semantic Awtsmoos Docs navigation.
 * @description The Awtsmoos is beyond every name and place; Awtsmoos.com gives
 * finite bookmarks and headings disciplined identities so links remain portable,
 * predictable, and unable to smuggle arbitrary DOM identity into document state.
 */
export const HEADING_TAGS = Object.freeze([
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6"
]);

/** Normalizes a human bookmark label while preserving readable intention. */
export function normalizeBookmarkName(value) {
	return String(value || "")
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, 80);
}

/** Creates durable bookmark identity independent of its editable human label. */
export function createBookmarkIdentity(name, randomId = crypto.randomUUID()) {
	const normalizedName = normalizeBookmarkName(name);
	if (!normalizedName) {
		throw new Error("Bookmark name is required");
	}
	const id = semanticToken(randomId) || semanticToken(crypto.randomUUID());
	return {
		id,
		name: normalizedName,
		target: bookmarkTargetId(id)
	};
}

/** Creates the browser id projected from one persisted bookmark id. */
export function bookmarkTargetId(bookmarkId) {
	return `bookmark-${semanticToken(bookmarkId)}`;
}

/** Creates the browser id projected from one persisted heading block id. */
export function headingTargetId(blockId) {
	return `heading-${semanticToken(blockId)}`;
}

/** Constrains arbitrary identity text to a fragment-safe token. */
export function semanticToken(value) {
	return String(value || "")
		.toLowerCase()
		.replace(/[^a-z0-9_-]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 96);
}
