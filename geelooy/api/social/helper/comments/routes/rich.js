/* B"H */
/** Native comments stay writable; imported corpora are additive and immutable. */
const { er, methodIs, getUserId } = require('./utils.js');
const store = require('../richCommentStore.js');
const { getImportedTreeReport } = require('../importedCommentTree.js');
function series($i) { return $i.$_GET?.seriesId || $i.$_POST?.seriesId || $i.$_DELETE?.seriesId || 'root'; }
function user($i, userid) { return getUserId($i, userid); }
function alias($i) { return $i.$_POST?.aliasId || $i.$_GET?.aliasId || ''; }
function imported(id) { return String(id || '').startsWith('imported_'); }
function readOnlyError() { return er({ code: 'IMPORTED_COMMENT_READ_ONLY', message: 'Imported source comments cannot be modified.' }); }
async function tree($i, heichelId, postId, includeImported = false) {
  const verseSection = $i.$_GET?.verseSection ?? '';
  const subsectionId = $i.$_GET?.subsectionId ?? '';
  const native = await store.getTree({ $i, heichelId, postId, verseSection, subsectionId });
  if (!includeImported) return native;
  const report = await getImportedTreeReport({ $i, heichelId, postId, seriesId: series($i), verseSection, subsectionId });
  return { success: [...(native.success || []), ...report.rows], meta: { native: native.success?.length || 0, ...report.meta }, warnings: report.warnings };
}
async function create($i, userid, heichelId, postId, parentId = '', parentSectionId = '') {
  if (imported(parentId)) return readOnlyError();
  return await store.createComment({ $i, userid: user($i, userid), heichelId, postId, seriesId: series($i), parentId, parentSectionId, aliasId: alias($i) });
}
function bad() { return er({ code: 'BAD_METHOD', message: 'Use the documented method.' }); }
module.exports = ({ $i, userid }) => ({
  '/heichelos/:heichel/posts/:post/comment-tree': async v => methodIs($i, 'GET') ? tree($i, v.heichel, v.post, true) : methodIs($i, 'POST') ? create($i, userid, v.heichel, v.post) : bad(),
  '/heichelos/:heichel/questions/:question/comment-tree': async v => methodIs($i, 'GET') ? tree($i, v.heichel, v.question) : methodIs($i, 'POST') ? create($i, userid, v.heichel, v.question) : bad(),
  '/heichelos/:heichel/answers/:answer/comment-tree': async v => methodIs($i, 'GET') ? tree($i, v.heichel, v.answer) : methodIs($i, 'POST') ? create($i, userid, v.heichel, v.answer) : bad(),
  '/heichelos/:heichel/posts/:post/comments/:comment': async v => imported(v.comment) ? readOnlyError() : methodIs($i, 'GET') ? store.getComment({ $i, heichelId: v.heichel, postId: v.post, commentId: v.comment }) : methodIs($i, 'DELETE') ? { success: await store.deleteOne({ $i, heichelId: v.heichel, postId: v.post, commentId: v.comment, reason: 'manual' }) } : bad(),
  '/heichelos/:heichel/posts/:post/comments/:comment/replies': async v => methodIs($i, 'POST') ? create($i, userid, v.heichel, v.post, v.comment) : methodIs($i, 'GET') ? tree($i, v.heichel, v.post) : bad(),
  '/heichelos/:heichel/posts/:post/comments/:comment/sections/:section/replies': async v => methodIs($i, 'POST') ? create($i, userid, v.heichel, v.post, v.comment, v.section) : methodIs($i, 'GET') ? tree($i, v.heichel, v.post) : bad(),
  '/entities/:heichel/:entity/comments/:comment/replies': async v => methodIs($i, 'POST') ? create($i, userid, v.heichel, v.entity, v.comment) : methodIs($i, 'GET') ? tree($i, v.heichel, v.entity) : bad(),
  '/entities/:heichel/:entity/comments/:comment/sections/:section/replies': async v => methodIs($i, 'POST') ? create($i, userid, v.heichel, v.entity, v.comment, v.section) : methodIs($i, 'GET') ? tree($i, v.heichel, v.entity) : bad(),
  '/entities/:heichel/:entity/comment-tree': async v => methodIs($i, 'GET') ? tree($i, v.heichel, v.entity) : methodIs($i, 'POST') ? create($i, userid, v.heichel, v.entity) : bad(),
  '/comments/url/:comment': async v => imported(v.comment) ? readOnlyError() : methodIs($i, 'GET') ? store.getCommentByUnique({ $i, commentId: v.comment }) : bad(),
  '/heichelos/:heichel/posts/:post/verses/:verse/comments': async v => methodIs($i, 'DELETE') ? store.deleteVerseComments({ $i, heichelId: v.heichel, postId: v.post, verseSection: v.verse }) : bad(),
  '/heichelos/:heichel/posts/:post/subsections/:subsection/comments': async v => methodIs($i, 'DELETE') ? store.deleteSubsectionComments({ $i, heichelId: v.heichel, postId: v.post, subsectionId: v.subsection }) : bad()
});
