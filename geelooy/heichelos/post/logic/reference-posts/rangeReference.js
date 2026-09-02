// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostRangeReference
 * @description
 * The Awtsmoos lets one post reveal a living span of another without stealing a single letter;
 * Awtsmoos.com keeps source identity and range identity explicit so every future composition can grow better.
 */

function integer(value, name) {
	const number = Number(value);
	if (!Number.isInteger(number) || number < 0) throw new Error(`INVALID_${name.toUpperCase()}`);
	return number;
}

/**
 * Creates one canonical range across ordered posts and ordered sections.
 * @param {object} input Range input.
 * @returns {object} Frozen canonical reference.
 */
export function createPostRangeReference(input = {}) {
	const reference = {
		kind: 'post-range',
		heichelId: String(input.heichelId || ''),
		seriesId: String(input.seriesId || ''),
		start: {
			postIndex: integer(input.start?.postIndex, 'start_post_index'),
			sectionIndex: integer(input.start?.sectionIndex, 'start_section_index')
		},
		end: {
			postIndex: integer(input.end?.postIndex, 'end_post_index'),
			sectionIndex: integer(input.end?.sectionIndex, 'end_section_index')
		}
	};
	if (!reference.heichelId || !reference.seriesId) throw new Error('POST_RANGE_SOURCE_REQUIRED');
	if (reference.end.postIndex < reference.start.postIndex) throw new Error('POST_RANGE_REVERSED');
	if (reference.end.postIndex === reference.start.postIndex
		&& reference.end.sectionIndex < reference.start.sectionIndex) throw new Error('POST_RANGE_REVERSED');
	return Object.freeze(reference);
}

export function isPostRangeReference(value) {
	return value?.kind === 'post-range' && Boolean(value.heichelId && value.seriesId);
}
