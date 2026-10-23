/* B"H */
/**
 * Native comments stay writable; safe reads are indexed and paginated.
 * Imported corpora are additive, immutable, and independently retrievable.
 */
const { er, methodIs, getUserId } = require('./utils.js');
const store = require('../richCommentStore.js');
const reader = require('../richCommentReader.js');
const { getImportedTreeReport } = require('../importedCommentTree.js');
const postRef = require('../postRefComment.js');

function series($i) { return $i.$_GET?.seriesId || $i.$_POST?.seriesId || $i.$_DELETE?.seriesId || 'root'; }
function user($i, userid) { return getUserId($i, userid) || bearerUserId($i); }
// Multi-user API auth (worker G, 2026-10-21): agent callers authenticate with
// the platform OAuth bearer (same tokenReader the packed import lane uses);
// the web session remains primary. Identity always comes from the verified
// bearer/session — never from client-claimed body fields.
function bearerUserId($i) {
	try {
		const { readBearer } = require('../../../../oauth/core/tokenReader.js');
		const resolved = readBearer($i);
		if (!resolved?.ok) return null;
		const entry = resolved.entry || {};
		return entry.userId ? String(entry.userId) : null;
	} catch {
		return null;
	}
}
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
	await postRef.enrichPostRefs($i, native.success || []);
	if (!includeImported) return native;
	const importedResult = await importedPage($i, heichelId, postId, true);
	// B"H — premade social threads: comments/replies imported as posts with parentPostId.
	let socialChildren = [];
	try {
		const { getPostsByParent } = require('../../packed/socialPacked.js');
		const rows = await getPostsByParent({ $i, parentPostId: postId, limit: 200 });
		socialChildren = rows.map(r => ({
			postId: r.postId, kind: r.kind || 'comment', parentPostId: r.parentPostId,
			authorName: r.authorName || r.aliasId || '', authorHandle: r.authorHandle || '',
			title: r.title || '', excerpt: r.excerpt || '', text: r.excerpt || '',
			createdAt: r.createdAt || r.updatedAt || 0, source: 'social-import'
		}));
	} catch (_) { /* social children optional */ }
	return {
		success: [...(native.success || []), ...(importedResult.success || []), ...socialChildren],
		meta: { native: native.success?.length || 0, social: socialChildren.length, ...importedResult.meta, nativePage: native.meta, importedPage: { returned: importedResult.success.length, offset: importedResult.meta.offset, limit: importedResult.meta.limit, hasMore: importedResult.meta.hasMore } },
		warnings: importedResult.warnings
	};
}

async function replies($i, heichelId, postId, commentId) {
	return reader.getReplies({ $i, heichelId, postId, commentId, ...nativeOptions($i) });
}

async function create($i, userid, heichelId, postId, parentId = '', parentSectionId = '') {
	if (imported(parentId)) return readOnlyError();
	const pr = $i.$_POST?.postRef;
	if (pr && typeof pr === 'object' && !parentId) {
		if (!user($i, userid)) return er({ code: 'NO_LOGIN', message: 'Login required to link a post as a comment.' });
		const authz = await postRef.authorizeTargetWrite({ $i, userid: user($i, userid), heichelId, postId });
		if (!authz) return er({ code: 'NOT_AUTHORIZED', message: 'Linking a post as a comment requires owning the target post or admin.' });
		return postRef.createPostRefComment({
			$i, heichelId, postId, seriesId: series($i),
			ref: { heichelId: pr.heichelId || heichelId, seriesId: pr.seriesId || 'root', postId: pr.postId },
			aliasId: $i.$_POST?.aliasId, commentatorName: $i.$_POST?.commentatorName,
			title: $i.$_POST?.title, excerpt: $i.$_POST?.excerpt,
			verseSection: $i.$_POST?.verseSection, masechta: $i.$_POST?.masechta
		});
	}
	return store.createComment({ $i, userid: user($i, userid), heichelId, postId, seriesId: series($i), parentId, parentSectionId, aliasId: alias($i) });
}

async function linkBatch($i, userid, heichelId) {
	if (!user($i, userid)) return er({ code: 'NO_LOGIN', message: 'Login required for post-ref link batch.' });
	const links = Array.isArray($i.$_POST?.links) ? $i.$_POST.links : [];
	if (!links.length) return er({ code: 'MISSING_PARAMS', message: 'links array is required.' });
	if (links.length > 500) return er({ code: 'BATCH_TOO_LARGE', message: 'At most 500 links per batch.' });
	const out = { created: 0, existed: 0, errors: [] };
	const authzCache = new Map();
	const canWrite = async postId => {
		if (!authzCache.has(postId)) authzCache.set(postId, await postRef.authorizeTargetWrite({ $i, userid: user($i, userid), heichelId, postId }));
		return authzCache.get(postId);
	};
	for (let n = 0; n < links.length; n++) {
		const link = links[n] || {};
		if (!(await canWrite(link.dafPostId || link.postId))) { out.errors.push({ index: n, error: 'NOT_AUTHORIZED: target post not owned by caller' }); continue; }
		try {
			const r = await postRef.createPostRefComment({
				$i, heichelId, postId: link.dafPostId || link.postId, seriesId: link.targetSeriesId || 'root',
				ref: { heichelId: link.refHeichelId || heichelId, seriesId: link.refSeriesId || 'root', postId: link.refPostId },
				aliasId: link.aliasId, commentatorName: link.commentatorName, title: link.title,
				excerpt: link.excerpt, verseSection: link.verseSection, masechta: link.masechta
			});
			if (r?.success) { if (r.existed) out.existed++; else out.created++; }
			else out.errors.push({ index: n, error: r?.error || r?.message || 'unknown' });
		} catch (e) { out.errors.push({ index: n, error: String(e?.message || e) }); }
		if (n % 25 === 24) await new Promise(resolve => setImmediate(resolve));
	}
	return { success: out };
}

function withSeries($i, seriesId) {
	$i.$_GET = { ...($i.$_GET || {}), seriesId };
	if (!$i.$_POST?.seriesId) $i.$_POST = { ...($i.$_POST || {}), seriesId };
}

module.exports = ({ $i, userid }) => ({
	'/heichelos/:heichel/posts/:post/comment-tree': async v => methodIs($i, 'GET') ? tree($i, v.heichel, v.post, true) : methodIs($i, 'POST') ? create($i, userid, v.heichel, v.post) : bad(),
	'/heichelos/:heichel/posts/:post/comments': async v => methodIs($i, 'GET') ? tree($i, v.heichel, v.post, true) : methodIs($i, 'POST') ? create($i, userid, v.heichel, v.post) : bad(),
	'/heichelos/:heichel/series/:series/post/:post/comments': async v => { withSeries($i, v.series); return methodIs($i, 'GET') ? tree($i, v.heichel, v.post, true) : methodIs($i, 'POST') ? create($i, userid, v.heichel, v.post) : bad(); },
	'/heichelos/:heichel/post-refs/link-batch': async v => methodIs($i, 'POST') ? linkBatch($i, userid, v.heichel) : bad(),
	'/heichelos/:heichel/posts/:post/imported-comment-tree': async v => methodIs($i, 'GET') ? importedPage($i, v.heichel, v.post) : readOnlyError(),
	'/heichelos/:heichel/questions/:question/comment-tree': async v => methodIs($i, 'GET') ? tree($i, v.heichel, v.question) : methodIs($i, 'POST') ? create($i, userid, v.heichel, v.question) : bad(),
	'/heichelos/:heichel/answers/:answer/comment-tree': async v => methodIs($i, 'GET') ? tree($i, v.heichel, v.answer) : methodIs($i, 'POST') ? create($i, userid, v.heichel, v.answer) : bad(),
	'/heichelos/:heichel/posts/:post/comments/:comment': async v => imported(v.comment) ? readOnlyError() : methodIs($i, 'GET') ? store.getComment({ $i, heichelId: v.heichel, postId: v.post, commentId: v.comment }) : methodIs($i, 'DELETE') ? ((await postRef.authorizeCommentDelete({ $i, userid: user($i, userid), heichelId: v.heichel, postId: v.post, commentId: v.comment })) ? { success: await store.deleteOne({ $i, heichelId: v.heichel, postId: v.post, commentId: v.comment, reason: 'manual' }) } : er({ code: 'NOT_AUTHORIZED', message: 'Only the comment author or admin may delete a comment.' })) : bad(),
	'/heichelos/:heichel/posts/:post/comments/:comment/replies': async v => methodIs($i, 'POST') ? create($i, userid, v.heichel, v.post, v.comment) : methodIs($i, 'GET') ? replies($i, v.heichel, v.post, v.comment) : bad(),
	'/heichelos/:heichel/posts/:post/comments/:comment/sections/:section/replies': async v => methodIs($i, 'POST') ? create($i, userid, v.heichel, v.post, v.comment, v.section) : methodIs($i, 'GET') ? replies($i, v.heichel, v.post, v.comment) : bad(),
	'/entities/:heichel/:entity/comments/:comment/replies': async v => methodIs($i, 'POST') ? create($i, userid, v.heichel, v.entity, v.comment) : methodIs($i, 'GET') ? replies($i, v.heichel, v.entity, v.comment) : bad(),
	'/entities/:heichel/:entity/comments/:comment/sections/:section/replies': async v => methodIs($i, 'POST') ? create($i, userid, v.heichel, v.entity, v.comment, v.section) : methodIs($i, 'GET') ? replies($i, v.heichel, v.entity, v.comment) : bad(),
	'/entities/:heichel/:entity/comment-tree': async v => methodIs($i, 'GET') ? tree($i, v.heichel, v.entity) : methodIs($i, 'POST') ? create($i, userid, v.heichel, v.entity) : bad(),
	'/comments/url/:comment': async v => imported(v.comment) ? readOnlyError() : methodIs($i, 'GET') ? store.getCommentByUnique({ $i, commentId: v.comment }) : bad(),
	'/heichelos/:heichel/posts/:post/verses/:verse/comments': async v => methodIs($i, 'DELETE') ? ((await postRef.authorizeTargetWrite({ $i, userid: user($i, userid), heichelId: v.heichel, postId: v.post })) ? store.deleteVerseComments({ $i, heichelId: v.heichel, postId: v.post, verseSection: v.verse }) : er({ code: 'NOT_AUTHORIZED', message: 'Only the post owner or admin may bulk-delete its comments.' })) : bad(),
	'/heichelos/:heichel/posts/:post/subsections/:subsection/comments': async v => methodIs($i, 'DELETE') ? ((await postRef.authorizeTargetWrite({ $i, userid: user($i, userid), heichelId: v.heichel, postId: v.post })) ? store.deleteSubsectionComments({ $i, heichelId: v.heichel, postId: v.post, subsectionId: v.subsection }) : er({ code: 'NOT_AUTHORIZED', message: 'Only the post owner or admin may bulk-delete its comments.' })) : bad()
});
