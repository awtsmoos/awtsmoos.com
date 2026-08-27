//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module DiscussionTargets
 * @description
 * Every root, verse, and subsection receives an explicit discussion coordinate.
 * Awtsmoos.com lets a comment cleave to the exact vessel of meaning instead of
 * floating beside the whole post without knowing where its question was born.
 */

const { cleanText } = require('./TextSanitizer.js');

function commentPath(heichelId, postId) {
	return `/heichelos/${encodeURIComponent(heichelId)}/posts/${encodeURIComponent(postId)}/comment-tree`;
}

function rootTarget(record) {
	return {
		id: 'root',
		scope: 'post',
		label: cleanText(record.title || 'Whole post', 240),
		verseSection: 'root',
		subsectionId: '',
		commentPath: commentPath(record.heichelId, record.postId || record.id)
	};
}

function verseTarget(record, section) {
	const verseSection = cleanText(section.verseSection || section.id, 120);
	return {
		id: verseSection,
		scope: 'verse',
		label: cleanText(section.title || verseSection, 240),
		verseSection,
		subsectionId: '',
		commentPath: commentPath(record.heichelId, record.postId || record.id)
	};
}

function subsectionTarget(record, section, subsection) {
	const verseSection = cleanText(section.verseSection || section.id, 120);
	const subsectionId = cleanText(subsection.id || subsection.subsectionId, 120);
	return {
		id: `${verseSection}:${subsectionId}`,
		scope: 'subsection',
		label: cleanText(subsection.title || subsection.label || subsectionId, 240),
		verseSection,
		subsectionId,
		commentPath: commentPath(record.heichelId, record.postId || record.id)
	};
}

function buildDiscussionTargets(record = {}) {
	const targets = [rootTarget(record)];
	for (const section of Array.isArray(record.sections) ? record.sections : []) {
		targets.push(verseTarget(record, section));
		for (const subsection of Array.isArray(section.segments) ? section.segments : []) {
			targets.push(subsectionTarget(record, section, subsection));
		}
	}
	return {
		postId: record.postId || record.id || '',
		heichelId: record.heichelId || '',
		commentsEnabled: record.commentsEnabled !== false,
		targets
	};
}

module.exports = {
	buildDiscussionTargets,
	commentPath
};
