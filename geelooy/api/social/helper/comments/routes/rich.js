/* B"H */
/**
 * Native comments stay writable; safe reads are indexed and paginated.
 * Imported corpora are additive, immutable, and independently retrievable.
 */
const { er, methodIs, getUserId } = require('./utils.js');
const store = require('../richCommentStore.js');
const reader = require('../richCommentReader.js');
const { getImportedTreeReport } = require('../importedCommentTree.js');

function series($i) { return $i.$_GET?.seriesId || $i.$_POST?.seriesId || $i.$_DELETE?.seriesId || 'root'; }
function user($i, userid) { return getUserId($i, userid); }
function alias($i) { return $i.$_POST?.aliasId || $i.$_GET?.aliasId || ''; }
function imported(id) { return String(id || '').startsWith('imported_'); }
function query($i, key, fallback = '') { return $i.$_GET?.[key] ?? fallback; }
function readOnlyError() { return er({ code: 'IMPORTED_COMMENT_READ_ONLY', message: 'Imported source comments cannot be modified.' }); }
function bad() { return er({ code: 'BAD_METHOD', message: 'Use the documented method.' }); }

function nativeOptions($i) {
	return {
		verseSection: query($i, 'verseSection'),
		subsectionId: query($i, 'subsectionId'),
		offset: query($i, 'offset', 0),
		limit: query($i, 'limit', 50),
		maxDepth: query($i, 'maxDepth', 5),
		replyLimit: query($i, 'replyLimit', 50)
	};
}

async function importedPage($i, heichelId, postId, useImportedPaging = false) {
	const verseSection = query($i, 'verseSection');
	const subsectionId = query($i, 'subsectionId');
	const report = await getImportedTreeReport({ $i, heichelId, postId, seriesId: series($i), verseSection, subsectionId });
	const kind = String(query($i, 'kind')).trim();
	const rows = kind ? (report.rows || []).filter(row => String(row?.dayuh?.kind || '') === kind) : (report.rows || []);
	const offsetKey = useImportedPaging ? 'importedOffset' : 'offset';
	const limitKey = useImportedPaging ? 'importedLimit' : 'limit';
	const offset = reader.integer(query($i, offsetKey, 0), 0, 0, Number.MAX_SAFE_INTEGER);
	const limit = reader.integer(query($i, limitKey, 100), 100, 1, 250);
	const page = rows.slice(offset, offset + limit);
	return {
		success: page,
		meta: { ...(report.meta || {}), totalImportedRows: rows.length, returnedImportedRows: page.length, offset, limit, hasMore: offset + page.length < rows.length, kind: kind || null },
		warnings: report.warnings || []
	};
}

async function tree($i, heichelId, postId, includeImported = false) {
	const native = await reader.getTree({ $i, heichelId, postId, ...nativeOptions($i) });
	if (!includeImported) return native;
	const importedResult = await importedPage($i, heichelId, postId, true);
	return {
		success: [...(native.success || []), ...(importedResult.success || [])],
		meta: { native: native.success?.length || 0, ...importedResult.meta, nativePage: native.meta, importedPage: { returned: importedResult.success.length, offset: importedResult.meta.offset, limit: importedResult.meta.limit, hasMore: importedResult.meta.hasMore } },
		warnings: importedResult.warnings
	};
}

async function replies($i, heichelId, postId, commentId) {
	return reader.getReplies({ $i, heichelId, postId, commentId, ...nativeOptions($i) });
}

async function create($i, userid, heichelId, postId, parentId = '', parentSectionId = '') {
	if (imported(parentId)) return readOnlyError();
	return store.createComment({ $i, userid: user($i, userid), heichelId, postId, seriesId: series($i), parentId, parentSectionId, aliasId: alias($i) });
}

module.exports = ({ $i, userid }) => ({
	'/heichelos/:heichel/posts/:post/comment-tree': async v => methodIs($i, 'GET') ? tree($i, v.heichel, v.post, true) : methodIs($i, 'POST') ? create($i, userid, v.heichel, v.post) : bad(),
	'/heichelos/:heichel/posts/:post/imported-comment-tree': async v => methodIs($i, 'GET') ? importedPage($i, v.heichel, v.post) : readOnlyError(),
	'/heichelos/:heichel/questions/:question/comment-tree': async v => methodIs($i, 'GET') ? tree($i, v.heichel, v.question) : methodIs($i, 'POST') ? create($i, userid, v.heichel, v.question) : bad(),
	'/heichelos/:heichel/answers/:answer/comment-tree': async v => methodIs($i, 'GET') ? tree($i, v.heichel, v.answer) : methodIs($i, 'POST') ? create($i, userid, v.heichel, v.answer) : bad(),
	'/heichelos/:heichel/posts/:post/comments/:comment': async v => imported(v.comment) ? readOnlyError() : methodIs($i, 'GET') ? store.getComment({ $i, heichelId: v.heichel, postId: v.post, commentId: v.comment }) : methodIs($i, 'DELETE') ? { success: await store.deleteOne({ $i, heichelId: v.heichel, postId: v.post, commentId: v.comment, reason: 'manual' }) } : bad(),
	'/heichelos/:heichel/posts/:post/comments/:comment/replies': async v => methodIs($i, 'POST') ? create($i, userid, v.heichel, v.post, v.comment) : methodIs($i, 'GET') ? replies($i, v.heichel, v.post, v.comment) : bad(),
	'/heichelos/:heichel/posts/:post/comments/:comment/sections/:section/replies': async v => methodIs($i, 'POST') ? create($i, userid, v.heichel, v.post, v.comment, v.section) : methodIs($i, 'GET') ? replies($i, v.heichel, v.post, v.comment) : bad(),
	'/entities/:heichel/:entity/comments/:comment/replies': async v => methodIs($i, 'POST') ? create($i, userid, v.heichel, v.entity, v.comment) : methodIs($i, 'GET') ? replies($i, v.heichel, v.entity, v.comment) : bad(),
	'/entities/:heichel/:entity/comments/:comment/sections/:section/replies': async v => methodIs($i, 'POST') ? create($i, userid, v.heichel, v.entity, v.comment, v.section) : methodIs($i, 'GET') ? replies($i, v.heichel, v.entity, v.comment) : bad(),
	'/entities/:heichel/:entity/comment-tree': async v => methodIs($i, 'GET') ? tree($i, v.heichel, v.entity) : methodIs($i, 'POST') ? create($i, userid, v.heichel, v.entity) : bad(),
	'/comments/url/:comment': async v => imported(v.comment) ? readOnlyError() : methodIs($i, 'GET') ? store.getCommentByUnique({ $i, commentId: v.comment }) : bad(),
	'/heichelos/:heichel/posts/:post/verses/:verse/comments': async v => methodIs($i, 'DELETE') ? store.deleteVerseComments({ $i, heichelId: v.heichel, postId: v.post, verseSection: v.verse }) : bad(),
	'/heichelos/:heichel/posts/:post/subsections/:subsection/comments': async v => methodIs($i, 'DELETE') ? store.deleteSubsectionComments({ $i, heichelId: v.heichel, postId: v.post, subsectionId: v.subsection }) : bad()
});
