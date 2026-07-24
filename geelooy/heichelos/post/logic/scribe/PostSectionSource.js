// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostSectionSource
 * @description
 * The Awtsmoos reveals one Torah stream through many vessels: the current API
 * places canonical verses on `post.sections`, while older scrolls place them
 * inside `post.dayuh.sections`. This boundary hears both forms and preserves
 * every punctuation-born segment as a stable subsection for Awtsmoos.com.
 */

function asOrderedArray(value) {
	if (Array.isArray(value)) return value;
	if (!value || typeof value !== "object") return [];
	return Object.values(value);
}

function meaningfulText(value) {
	return String(value ?? "").trim().length > 0;
}

function normalizeSegment(segment, index) {
	if (typeof segment === "string") {
		return {
			id: `segment_${index}`,
			content: segment,
			order: index
		};
	}
	if (!segment || typeof segment !== "object") return null;
	const content = segment.content ?? segment.text ?? segment.html ?? segment.body ?? "";
	if (!meaningfulText(content)) return null;
	return {
		...segment,
		content,
		order: Number.isFinite(segment.order) ? segment.order : index
	};
}

function sourceSegments(section) {
	const candidates = [
		section?.segments,
		section?.subSections,
		section?.subsections,
		section?.paragraphs
	];
	return candidates.find(Array.isArray) || [];
}

function normalizeSection(section, index) {
	const base = typeof section === "string" ? { content: section } : { ...(section || {}) };
	const segments = sourceSegments(base)
		.map(normalizeSegment)
		.filter(Boolean)
		.sort((left, right) => left.order - right.order);
	return {
		...base,
		id: base.id || base.sectionId || `verse_${index}`,
		sectionId: base.sectionId || base.id || `verse_${index}`,
		verseSection: base.verseSection ?? index,
		order: Number.isFinite(base.order) ? base.order : index,
		subSections: segments.length ? segments : base.subSections
	};
}

/**
 * Resolves the canonical section array from current or legacy API shapes.
 * @param {object} post Post API payload.
 * @returns {Array<object>} Ordered normalized verse vessels.
 */
export function resolvePostSections(post) {
	const current = asOrderedArray(post?.sections);
	const legacy = asOrderedArray(post?.dayuh?.sections);
	const source = current.length ? current : legacy;
	return source
		.map(normalizeSection)
		.sort((left, right) => left.order - right.order);
}

/**
 * Wraps current top-level sections in the legacy scribe vessel without mutating
 * the API payload held by comments, navigation, or search.
 * @param {object} post Post API payload.
 * @returns {object|null} Scribe-ready post, or null when no sections exist.
 */
export function prepareStructuredPost(post) {
	const sections = resolvePostSections(post);
	if (!sections.length) return null;
	return {
		...post,
		dayuh: {
			...(post.dayuh || {}),
			sections
		}
	};
}
