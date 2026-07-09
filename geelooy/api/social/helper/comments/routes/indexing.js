/*B"H*/
/**
 * @module CommentIndexRoutes
 * @description
 * Alias profile routes read the dedicated packed alias-comment index. The
 * comment body remains in the universal comment-tree; this route returns the
 * map of where each alias spoke: heichel, series, post, root replies and nested
 * replies included through the same pointer shape.
 */
const { addCommentIndexToAlias, updateAllCommentIndexes } = require('../index.js');
const aliasIndex = require('../aliasCommentIndex.js');
const { er, methodIs, getUserId } = require('./utils.js');

function item(id, kind) { return { id, name: id, kind }; }
function listIds(ids, kind) { return (ids || []).filter(Boolean).map(id => item(id, kind)); }
function pointers(rows) { return { success: Array.isArray(rows) ? rows : [] }; }

module.exports = ({ $i, userid }) => ({
  '/aliases/:alias/commentsMade': async vars => pointers(aliasIndex.allFor($i, vars.alias)),

  '/aliases/:alias/commentsMade/heichelos': async vars => ({
    success: listIds(aliasIndex.heichelosFor($i, vars.alias), 'comment-heichel')
  }),

  '/aliases/:alias/commentsMade/heichel/:heichel': async vars => {
    return pointers(aliasIndex.forHeichel($i, vars.alias, vars.heichel));
  },

  '/aliases/:alias/commentsMade/heichel/:heichel/series': async vars => ({
    success: listIds(aliasIndex.seriesFor($i, vars.alias, vars.heichel), 'comment-series')
  }),

  '/aliases/:alias/commentsMade/heichel/:heichel/series/:series': async vars => {
    return pointers(aliasIndex.forSeries($i, vars.alias, vars.heichel, vars.series));
  },

  '/aliases/:alias/commentsMade/heichel/:heichel/series/:series/posts': async vars => ({
    success: listIds(aliasIndex.postsFor($i, vars.alias, vars.heichel, vars.series), 'comment-post')
  }),

  '/aliases/:alias/commentsMade/heichel/:heichel/series/:series/post/:post': async vars => {
    return pointers(aliasIndex.forPost($i, vars.alias, vars.heichel, vars.series, vars.post));
  },

  '/heichelos/:heichel/aliases/:alias/commentsActions/addCommentIndexToAlias/comment/:comment': async vars => {
    if (!methodIs($i, 'POST')) return er({ message: 'POST only request', code: 'POST_ONLY' });
    const seriesId = $i.$_POST.seriesId;
    if (!seriesId) return er({ message: 'Missing required POST parameter: seriesId', code: 'MISSING_PARAMS' });
    return await addCommentIndexToAlias({
      $i,
      userid: getUserId($i, userid),
      aliasId: vars.alias,
      heichelId: vars.heichel,
      seriesId
    });
  },

  '/heichelos/:heichel/aliases/:alias/commentsActions/updateAllCommentIndexes': async vars => {
    if (!methodIs($i, 'POST')) return { message: 'Use POST. This endpoint is legacy compatibility.' };
    const requestingUserid = getUserId($i, userid);
    if (!requestingUserid) return er({ message: "You're not logged in" });
    return await updateAllCommentIndexes({ $i, userid: requestingUserid, aliasId: vars.alias, heichelId: vars.heichel });
  }
});
