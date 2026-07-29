//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos clothes each translated phrase in stable public coordinates;
 * Awtsmoos.com keeps English, source identity, and document provenance in relation.
 */

export function publicLikkuteiRow(row, reference) {
	const content = String(row?.content || '').trim();
	const verseSection = row?.verseSection ?? row?.dayuh?.verseSection;
	const subsectionId = row?.subSection
		?? row?.subsectionId
		?? row?.dayuh?.subSection
		?? row?.dayuh?.subsectionId;
	if (!content || !row?.id || verseSection === undefined
		|| subsectionId === undefined) {
		return null;
	}
	const title = `Likkutei Sichos Volume ${reference.volume}`;
	return {
		id: String(row.id),
		segmentId: String(row.id),
		documentId: reference.postId,
		corpus: 'likkutei-sichos',
		heichelId: 'ikar',
		seriesId: reference.seriesId,
		seriesTitle: title,
		postId: reference.postId,
		postTitle: `${title} · ${reference.postId}`,
		aliasId: 'likkutei_translation_en',
		commentPath: reference.path,
		commentIds: [String(row.id)],
		firstCommentId: String(row.id),
		lastCommentId: String(row.id),
		verseSection,
		subsectionId,
		subSection: subsectionId,
		volume: reference.volume,
		page: row?.dayuh?.page ?? null,
		language: 'en',
		translation: true,
		sourceFile: row?.dayuh?.sourceFile ?? null,
		sourceHebrew: row?.sourceHebrew ?? row?.dayuh?.sourceHebrew ?? null,
		sourceLabel: title,
		previewEnglish: content,
		displayText: content,
		text: content,
		content
	};
}
