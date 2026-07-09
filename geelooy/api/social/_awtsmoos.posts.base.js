//B"H
/**
 * @module SocialPostsRoutes
 * @description
 * Chapter 905: The post gate now recognizes a reflected chamber.
 *
 * Normal series still read their own posts. Virtual series read through a small
 * dereference layer, letting stable/friendly IDs aggregate canonical child
 * series without duplicating post storage or breaking comment paths.
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
const { installSocialDbBridge } = require('./helper/packed/socialDbBridgeInstaller.js');
const { getVirtualPostsInSeries, getVirtualPostFromSeries } = require('./helper/series/virtualSeries.js');

function decodeCrumbPath(value = '') {
  try { return decodeURIComponent(Buffer.from(value, 'base64').toString('utf-8')); }
  catch { return ''; }
}

function parseMap(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); }
  catch { return null; }
}

function parseProperties($i) {
  return parseMap($i.$_GET?.properties || $i.$_GET?.propertyMap);
}

async function readPostsRoute({ $i, heichelId, seriesId, withDetails }) {
  const properties = parseProperties($i);
  const virtual = await getVirtualPostsInSeries({ $i, heichelId, seriesId, withDetails, properties });
  if (virtual) return virtual;
  return getPostsInSeries({ $i, heichelId, seriesId, withDetails, properties });
}

async function readPostRoute({ $i, heichelId, seriesId, postId }) {
  const properties = parseProperties($i);
  const virtual = await getVirtualPostFromSeries({ $i, heichelId, seriesId, postId, properties });
  if (virtual) return virtual;
  return getPostFromSeries({ $i, heichelId, seriesId, postId });
}

module.exports = ({ $i, userid } = {}) => {
  installSocialDbBridge($i);
  return {
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
      if ($i.request.method === 'GET') return readPostsRoute({ $i, heichelId: v.heichel, seriesId: v.series, withDetails: $i.$_GET?.details === 'true' });
      if ($i.request.method !== 'POST') return er({ code: 'METHOD_NOT_ALLOWED' });
      $i.$_POST.seriesId = v.series;
      return addPostToSeries({ $i, heichelId: v.heichel, seriesId: v.series });
    },

    '/heichelos/:heichel/series/:series/posts/details': async v => {
      if ($i.request.method !== 'GET') return er({ code: 'METHOD_NOT_ALLOWED', method: $i.request.method });
      return readPostsRoute({ $i, heichelId: v.heichel, seriesId: v.series, withDetails: true });
    },

    '/heichelos/:heichel/series/:series/post/:post': async v => {
      if ($i.request.method === 'GET') return readPostRoute({ $i, heichelId: v.heichel, seriesId: v.series, postId: v.post });
      if ($i.request.method === 'PUT') return editPostInSeries({ $i, heichelId: v.heichel, seriesId: v.series, postId: v.post });
      if ($i.request.method !== 'DELETE') return er({ code: 'METHOD_NOT_ALLOWED' });
      if (!$i.$_DELETE) $i.$_DELETE = {};
      $i.$_DELETE.aliasId = $i.$_DELETE.aliasId || $i.$_QUERY?.aliasId || $i.$_GET?.aliasId;
      if (!$i.$_DELETE.aliasId) return er({ code: 'AUTH_NEEDED', details: 'aliasId required for deletion' });
      return deletePostFromSeries({ $i, heichelId: v.heichel, seriesId: v.series, postId: v.post, userid });
    },

    '/heichelos/:heichel/series/:series/post/:post/delete': async v => deletePostFromSeries({ $i, heichelId: v.heichel, seriesId: v.series, postId: v.post, userid }),

    '/heichelos/:heichel/series/:series/filterPostsBy/:propKey/:propVal': async v => {
      if ($i.request.method !== 'GET') return er({ code: 'METHOD_NOT_ALLOWED' });
      return getPostsByProperty({ $i, heichelId: v.heichel, seriesId: v.series, propertyKey: decodeURIComponent(v.propKey || ''), propertyValue: decodeURIComponent(v.propVal || '') });
    }
  };
};
