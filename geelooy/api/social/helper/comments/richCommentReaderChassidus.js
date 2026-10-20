//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module RichCommentReaderChassidus
 * @description Chassidus per-post fallback and index selection (split from richCommentReader.js, verbatim).
 */

const paths = require('./richCommentPaths.js');
const access = require('./richCommentAccess.js');

	const { array, present, same, context } = require("./richCommentReaderCore.js");

// === Chassidus per-post translation fallback (2026-09-29) ===
const CHASSIDUS_BASE = '/ikar/social/chassidus_translations';
const CHASSIDUS_ALIASES = ['likkutei_translation_en', 'likkuteitorah_translation_en', 'sefer_hasichos_translation_en', 'sichos_kodesh_translation_en', 'meluket_translation_en', 'derechmitzvosecha_translation_en', 'torahohr_translation_en', 'ayinbeis_translation_en'];

function perPostIdsFor({ $i, heichelId, postId, verseSection, subsectionId }) {
	if (heichelId !== 'ikar' || !postId) return [];
	const ids = [];
	for (const alias of CHASSIDUS_ALIASES) {
		let postData = null;
		try {
			postData = access.read($i, CHASSIDUS_BASE + '/' + alias + '/' + postId + '.json', null);
		} catch { continue; }
		if (!postData || !Array.isArray(postData.comments)) continue;
		for (const c of postData.comments) {
			if (!c || !c.id || c.parentId) continue;
			if (present(verseSection) && !same(c.verseSection, verseSection)) continue;
			if (present(subsectionId) && !same(c.subsectionId, subsectionId)) continue;
			ids.push(c.id);
		}
	}
	return ids;
}
// === End Chassidus fallback ===

function indexedIds({ $i, heichelId, postId, verseSection, subsectionId }) {
	let result;
	if (present(subsectionId)) {
		const target = paths.subsectionIndexPath(context(heichelId, postId, { subsectionId }));
		result = { index: 'subsection', ids: array(access.read($i, target, [])) };
	} else if (present(verseSection)) {
		const target = paths.verseIndexPath(context(heichelId, postId, { verseSection }));
		result = { index: 'verse', ids: array(access.read($i, target, [])) };
	} else {
		result = { index: 'roots', ids: array(access.read($i, paths.rootChildrenPath(context(heichelId, postId)), [])) };
	}
	// Union per-post translation IDs with standard IDs (deduped), so posts that
	// have both native comments and imported translations serve both.
	const perPostIds = perPostIdsFor({ $i, heichelId, postId, verseSection, subsectionId });
	if (perPostIds.length > 0) {
		const seen = new Set(result.ids);
		for (const id of perPostIds) {
			if (!seen.has(id)) { seen.add(id); result.ids.push(id); }
		}
		return { index: result.index + '+chassidus', ids: result.ids };
	}
	return result;
}

function matches(comment, verseSection, subsectionId) {
	if (comment.parentId) return false;
	if (present(verseSection) && !same(comment.verseSection, verseSection)) return false;
	if (present(subsectionId) && !same(comment.subsectionId, subsectionId)) return false;
	return true;
}

module.exports = {
	perPostIdsFor,
	indexedIds,
	matches,
};
