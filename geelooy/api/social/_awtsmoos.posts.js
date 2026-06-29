// B"H
/**
 * @module SocialPostsCompatibilityRoutes
 * @description Old ikar post gates and new series gates stand together. The
 * base module keeps refactored routes; this wrapper restores legacy roots and
 * gives unsupported methods one consistent vessel.
 */
const createBaseRoutes = require('./_awtsmoos.posts.base.js');
const { getPostsInSeries, addPostToSeries, getSubmittedPosts, approveSubmittedPost, denySubmittedPost } = require('./helper/index.js');
const { installSocialDbBridge } = require('./helper/packed/socialDbBridgeInstaller.js');
const { methodNotAllowed } = require('./helper/response/routeResponses.js');

function parseMap(value) { if (!value) return null; if (typeof value === 'object') return value; try { return JSON.parse(value); } catch { return null; } }
function get($i) { return $i.$_GET || {}; }
function post($i) { return $i.$_POST || {}; }
function body($i) { return post($i) || $i.$_DELETE || {}; }
function props($i) { return parseMap(get($i).properties || get($i).propertyMap); }
function wantsDetails($i, forced = false) { return forced || get($i).details === 'true'; }
function rootPosts($i, heichelId, details = false) { return getPostsInSeries({ $i, heichelId, seriesId: 'root', withDetails: wantsDetails($i, details), properties: props($i) }); }
function rootWrite($i, heichelId) { if (!$i.$_POST) $i.$_POST = {}; $i.$_POST.seriesId = $i.$_POST.seriesId || 'root'; return addPostToSeries({ $i, heichelId, seriesId: $i.$_POST.seriesId }); }
function bad($i, allowed) { return methodNotAllowed($i?.request?.method, allowed); }

module.exports = ({ $i, userid } = {}) => {
  installSocialDbBridge($i);
  const base = createBaseRoutes({ $i, userid });
  return {
    ...base,
    '/heichelos/:heichel/posts': async v => {
      if ($i.request.method === 'GET') return rootPosts($i, v.heichel);
      if ($i.request.method === 'POST') return rootWrite($i, v.heichel);
      return bad($i, ['GET', 'POST']);
    },
    '/heichelos/:heichel/posts/details': async v => {
      if ($i.request.method !== 'GET') return bad($i, ['GET']);
      return rootPosts($i, v.heichel, true);
    },
    '/heichelos/:heichel/submittedPosts': async v => {
      if ($i.request.method !== 'GET') return bad($i, ['GET']);
      return getSubmittedPosts({ $i, heichelId: v.heichel });
    },
    '/heichelos/:heichel/submittedPosts/approve': async v => {
      if ($i.request.method !== 'POST') return bad($i, ['POST']);
      return approveSubmittedPost({ $i, heichelId: v.heichel, postId: post($i).postId, approverAliasId: post($i).aliasId, addPostToSeries });
    },
    '/heichelos/:heichel/submittedPosts/deny': async v => {
      if ($i.request.method !== 'POST' && $i.request.method !== 'DELETE') return bad($i, ['POST', 'DELETE']);
      const b = body($i);
      return denySubmittedPost({ $i, heichelId: v.heichel, postId: b.postId, approverAliasId: b.aliasId });
    }
  };
};
