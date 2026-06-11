/* B"H */
/**
 * @module RichCommentRoutes
 * @description
 * Chapter 180: Public comment-tree gates for every entity. Replies may target
 * a full comment or a single section inside a comment.
 */

const { er, methodIs, getUserId } = require('./utils.js');
const { createComment, getTree, getComment, getCommentByUnique, deleteOne, deleteVerseComments, deleteSubsectionComments } = require('../richCommentStore.js');

function series($i) { return $i.$_GET?.seriesId || $i.$_POST?.seriesId || $i.$_DELETE?.seriesId || 'root'; }
function user($i, userid) { return getUserId($i, userid); }
function alias($i) { return $i.$_POST.aliasId || $i.$_GET.aliasId || ''; }
async function tree($i, heichelId, postId) { return await getTree({ $i, heichelId, postId, verseSection: $i.$_GET.verseSection || '', subsectionId: $i.$_GET.subsectionId || '' }); }
async function rootCreate($i, userid, heichelId, postId) { return await createComment({ $i, userid: user($i, userid), heichelId, postId, seriesId: series($i), parentId: '', aliasId: alias($i) }); }
async function reply($i, userid, heichelId, postId, parentId, parentSectionId = '') { return await createComment({ $i, userid: user($i, userid), heichelId, postId, seriesId: series($i), parentId, parentSectionId, aliasId: alias($i) }); }

module.exports = ({ $i, userid }) => ({
  '/heichelos/:heichel/posts/:post/comment-tree': async vars => {
    if (methodIs($i, 'GET')) return await tree($i, vars.heichel, vars.post);
    if (methodIs($i, 'POST')) return await rootCreate($i, userid, vars.heichel, vars.post);
    return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
  },
  '/heichelos/:heichel/questions/:question/comment-tree': async vars => {
    if (methodIs($i, 'GET')) return await tree($i, vars.heichel, vars.question);
    if (methodIs($i, 'POST')) return await rootCreate($i, userid, vars.heichel, vars.question);
    return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
  },
  '/heichelos/:heichel/answers/:answer/comment-tree': async vars => {
    if (methodIs($i, 'GET')) return await tree($i, vars.heichel, vars.answer);
    if (methodIs($i, 'POST')) return await rootCreate($i, userid, vars.heichel, vars.answer);
    return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
  },
  '/heichelos/:heichel/posts/:post/comments/:comment': async vars => {
    if (methodIs($i, 'GET')) return await getComment({ $i, heichelId: vars.heichel, postId: vars.post, commentId: vars.comment });
    if (methodIs($i, 'DELETE')) return { success: await deleteOne({ $i, heichelId: vars.heichel, postId: vars.post, commentId: vars.comment, reason: 'manual' }) };
    return er({ code: 'BAD_METHOD', message: 'Use GET or DELETE.' });
  },
  '/heichelos/:heichel/posts/:post/comments/:comment/replies': async vars => {
    if (methodIs($i, 'POST')) return await reply($i, userid, vars.heichel, vars.post, vars.comment);
    if (methodIs($i, 'GET')) return await tree($i, vars.heichel, vars.post);
    return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
  },
  '/heichelos/:heichel/posts/:post/comments/:comment/sections/:section/replies': async vars => {
    if (methodIs($i, 'POST')) return await reply($i, userid, vars.heichel, vars.post, vars.comment, vars.section);
    if (methodIs($i, 'GET')) return await tree($i, vars.heichel, vars.post);
    return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
  },
  '/entities/:heichel/:entity/comments/:comment/replies': async vars => {
    if (methodIs($i, 'POST')) return await reply($i, userid, vars.heichel, vars.entity, vars.comment);
    if (methodIs($i, 'GET')) return await tree($i, vars.heichel, vars.entity);
    return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
  },
  '/entities/:heichel/:entity/comments/:comment/sections/:section/replies': async vars => {
    if (methodIs($i, 'POST')) return await reply($i, userid, vars.heichel, vars.entity, vars.comment, vars.section);
    if (methodIs($i, 'GET')) return await tree($i, vars.heichel, vars.entity);
    return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
  },
  '/entities/:heichel/:entity/comment-tree': async vars => {
    if (methodIs($i, 'GET')) return await tree($i, vars.heichel, vars.entity);
    if (methodIs($i, 'POST')) return await rootCreate($i, userid, vars.heichel, vars.entity);
    return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
  },
  '/comments/url/:comment': async vars => {
    if (!methodIs($i, 'GET')) return er({ code: 'BAD_METHOD', message: 'Use GET.' });
    return await getCommentByUnique({ $i, commentId: vars.comment });
  },
  '/heichelos/:heichel/posts/:post/verses/:verse/comments': async vars => {
    if (!methodIs($i, 'DELETE')) return er({ code: 'BAD_METHOD', message: 'Use DELETE.' });
    return await deleteVerseComments({ $i, heichelId: vars.heichel, postId: vars.post, verseSection: vars.verse });
  },
  '/heichelos/:heichel/posts/:post/subsections/:subsection/comments': async vars => {
    if (!methodIs($i, 'DELETE')) return er({ code: 'BAD_METHOD', message: 'Use DELETE.' });
    return await deleteSubsectionComments({ $i, heichelId: vars.heichel, postId: vars.post, subsectionId: vars.subsection });
  }
});
