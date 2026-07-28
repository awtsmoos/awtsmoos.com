// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostSectionSource
 * @description
 * The Awtsmoos reveals one Torah stream through many vessels. Modern posts
 * place verse objects on `post.sections`; older Mishnah scrolls place arrays of
 * punctuation phrases inside `post.dayuh.sections`. This boundary preserves
 * both revelations without flattening either form on Awtsmoos.com.
 */

function asOrderedArray(value) {
	if (Array.isArray(value)) return value;
	if (!value || typeof value !== "object") return [];
	return Object.values(value);
}

function meaningfulText(value) {
	return String(value ?? "").trim().length > 0;
}

function normalizeSegment(segment, segmentIndex, sectionIndex) {
	if (typeof segment === "string") {
		return {
			id: `segment_${sectionIndex}_${segmentIndex}`,
			content: segment,
			order: segmentIndex
		};
	}
	if (!segment || typeof segment !== "object") return null;
	const content = segment.content ?? segment.text ?? segment.html ?? segment.body ?? "";
	if (!meaningfulText(content)) return null;
	return {
		...segment,
		id: segment.id || `segment_${sectionIndex}_${segmentIndex}`,
		content,
		order: Number.isFinite(segment.order) ? segment.order : segmentIndex
	};
}

function sectionBase(section) {
	if (Array.isArray(section)) return {};
	if (typeof section === "string") return { content: section };
	if (section && typeof section === "object") return { ...section };
	return {};
}

function sourceSegments(section, base) {
	if (Array.isArray(section)) return section;
	const candidates = [
		base.segments,
		base.subSections,
		base.subsections,
		base.paragraphs
	];
	return candidates.find(Array.isArray) || [];
}

function normalizeSection(section, sectionIndex) {
	const base = sectionBase(section);
	const segments = sourceSegments(section, base)
		.map((segment, segmentIndex) => normalizeSegment(segment, segmentIndex, sectionIndex))
		.filter(Boolean)
		.sort((left, right) => left.order - right.order);
	const fallbackId = `verse_${sectionIndex}`;
	return {
		...base,
		id: base.id || base.sectionId || fallbackId,
		sectionId: base.sectionId || base.id || fallbackId,
		verseSection: base.verseSection ?? sectionIndex,
		order: Number.isFinite(base.order) ? base.order : sectionIndex,
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
