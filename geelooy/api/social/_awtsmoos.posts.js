//B"H
/**
 * @module SocialPostsRoutes
 * @description
 * Chapter 18: The new scroll answered before the old cave echoed.
 *
 * The Awtsmoos recreates every byte from nothing, yet the API must choose an
 * order when two vessels contain the same post. This route now reads the new
 * `social.allPosts.awtsdb` post body first and keeps legacy DosDB as backup.
 * Lists/details merge both worlds with the new allPosts record winning dupes.
 */

const {
  addPostToSeries,
  editPostInSeries,
  deletePostFromSeries,
  getPostFromSeries,
  getPostsInSeries,
  getPostsByProperty,
  getPostsOfAliasInSeries,
  getSeriesOfPostsOfAliasInHeichel,
  getHeichelosOfPostsOfAlias,
  getSubmittedPosts,
  approveSubmittedPost,
  denySubmittedPost,
  er
} = require('./helper/index.js');

const {
  readPackedPost,
  listPackedPosts,
  mergePosts,
  mergePostIds,
  filterPackedPostIds
} = require('./helper/packed/postPackedBridge.js');

/**
 * @description Decodes an older base64 breadcrumb without letting malformed
 * crumbs tear the veil of the request chamber.
 * @param {string} value Encoded crumb.
 * @returns {string} Decoded crumb or empty string.
 */
function decodeCrumbPath(value = '') {
  try { return decodeURIComponent(Buffer.from(value, 'base64').toString('utf-8')); }
  catch { return ''; }
}

/**
 * @description Parses optional property filters.
 * @param {object} $i Request context.
 * @returns {object|null} Parsed properties or null.
 */
function parseProperties($i) {
  if (!$i.$_GET?.properties) return null;
  try { return JSON.parse($i.$_GET.properties); }
  catch { return null; }
}

/**
 * @description Detects helper error envelopes.
 * @param {*} value Any helper result.
 * @returns {boolean} Whether the value is an error envelope.
 */
function isError(value) {
  return Boolean(value && typeof value === 'object' && value.error);
}

/**
 * @description Reads list/detail post routes from old plus new with new winning.
 * @param {object} input Named input.
 * @returns {Promise<object[]|string[]|object>} Merged posts, ids, or error.
 */
async function readPostsFromBothStores({ $i, heichelId, seriesId, withDetails, properties }) {
  const legacy = await getPostsInSeries({ $i, heichelId, seriesId, withDetails, properties });
  if (isError(legacy)) return legacy;
  const packed = listPackedPosts({ $i, heichelId, seriesId });
  return withDetails ? mergePosts(Array.isArray(legacy) ? legacy : [], packed) : mergePostIds(Array.isArray(legacy) ? legacy : [], packed);
}

/**
 * @description Reads one post from allPosts first, legacy DosDB second.
 * @param {object} input Named input.
 * @returns {Promise<object>} Post object or error envelope.
 */
async function readOnePostNewFirst({ $i, heichelId, seriesId, postId }) {
  const packed = readPackedPost({ $i, heichelId, seriesId, postId });
  if (packed) return packed;
  const legacy = await getPostFromSeries({ $i, heichelId, seriesId, postId });
  return isError(legacy) ? legacy : { ...legacy, _awtsmoosSource: legacy._awtsmoosSource || 'legacyDosDB' };
}

/**
 * @description Filters ids from both stores, packed ids first in the result.
 * @param {object} input Named input.
 * @returns {Promise<string[]|object>} Matching ids or error.
 */
async function filterPostsFromBothStores({ $i, heichelId, seriesId, propertyKey, propertyValue }) {
  const legacy = await getPostsByProperty({ $i, heichelId, seriesId, propertyKey, propertyValue });
  if (isError(legacy)) return legacy;
  const packed = filterPackedPostIds({ posts: listPackedPosts({ $i, heichelId, seriesId }), propertyKey, propertyValue });
  return Array.from(new Set([...packed, ...(Array.isArray(legacy) ? legacy : [])]));
}

module.exports = ({ $i, userid } = {}) => ({
  '/aliases/:alias/postsMade/heichel/:heichel/pathToSeries/:pathive': async vars => getPostsOfAliasInSeries({
    $i,
    aliasId: vars.alias,
    crumbpath: decodeCrumbPath(vars.pathive || ''),
    heichelId: vars.heichel,
    withDetails: true
  }),

  '/aliases/:alias/postsMade/heichelos': async vars => getHeichelosOfPostsOfAlias({ $i, aliasId: vars.alias }),

  '/aliases/:alias/postsMade/heichel/:heichel/series': async vars => getSeriesOfPostsOfAliasInHeichel({
    $i,
    aliasId: vars.alias,
    heichelId: vars.heichel
  }),

  '/heichelos/:heichel/submittedPosts': async vars => {
    if ($i.request.method !== 'GET') return er({ code: 'METHOD_NOT_ALLOWED' });
    return getSubmittedPosts({ $i, heichelId: vars.heichel });
  },

  '/heichelos/:heichel/submittedPosts/approve': async vars => {
    if ($i.request.method !== 'POST') return er({ code: 'METHOD_NOT_ALLOWED' });
    return approveSubmittedPost({ $i, heichelId: vars.heichel, postId: $i.$_POST.postId, approverAliasId: $i.$_POST.aliasId, addPostToSeries });
  },

  '/heichelos/:heichel/submittedPosts/deny': async vars => {
    if ($i.request.method !== 'POST' && $i.request.method !== 'DELETE') return er({ code: 'METHOD_NOT_ALLOWED' });
    const body = $i.$_POST || $i.$_DELETE || {};
    return denySubmittedPost({ $i, heichelId: vars.heichel, postId: body.postId, approverAliasId: body.aliasId });
  },

  '/heichelos/:heichel/series/:series/posts': async v => {
    if ($i.request.method === 'GET') {
      return readPostsFromBothStores({
        $i,
        heichelId: v.heichel,
        seriesId: v.series,
        withDetails: $i.$_GET?.details === 'true',
        properties: parseProperties($i)
      });
    }
    if ($i.request.method !== 'POST') return er({ code: 'METHOD_NOT_ALLOWED' });
    $i.$_POST.seriesId = v.series;
    return addPostToSeries({ $i, heichelId: v.heichel, seriesId: v.series });
  },

  '/heichelos/:heichel/series/:series/posts/details': async v => {
    if ($i.request.method !== 'GET') return er({ code: 'METHOD_NOT_ALLOWED', method: $i.request.method });
    return readPostsFromBothStores({ $i, heichelId: v.heichel, seriesId: v.series, withDetails: true, properties: parseProperties($i) });
  },

  '/heichelos/:heichel/series/:series/post/:post': async v => {
    if ($i.request.method === 'GET') return readOnePostNewFirst({ $i, heichelId: v.heichel, seriesId: v.series, postId: v.post });
    if ($i.request.method === 'PUT') return editPostInSeries({ $i, heichelId: v.heichel, seriesId: v.series, postId: v.post });
    if ($i.request.method !== 'DELETE') return er({ code: 'METHOD_NOT_ALLOWED' });
    if (!$i.$_DELETE) $i.$_DELETE = {};
    $i.$_DELETE.aliasId = $i.$_DELETE.aliasId || $i.$_QUERY?.aliasId || $i.$_GET?.aliasId;
    if (!$i.$_DELETE.aliasId) return er({ code: 'AUTH_NEEDED', details: 'aliasId required for deletion' });
    return deletePostFromSeries({ $i, heichelId: v.heichel, seriesId: v.series, postId: v.post, userid });
  },

  '/heichelos/:heichel/series/:series/post/:post/delete': async v => deletePostFromSeries({
    $i,
    heichelId: v.heichel,
    seriesId: v.series,
    postId: v.post,
    userid
  }),

  '/heichelos/:heichel/series/:series/filterPostsBy/:propKey/:propVal': async v => {
    if ($i.request.method !== 'GET') return er({ code: 'METHOD_NOT_ALLOWED' });
    const propertyKey = decodeURIComponent(v.propKey || '');
    const propertyValue = decodeURIComponent(v.propVal || '');
    return filterPostsFromBothStores({ $i, heichelId: v.heichel, seriesId: v.series, propertyKey, propertyValue });
  }
});
