// B"H
/**
 * @module SocialPostsCompatibilityRoutes
 * @description Old ikar post gates and new series gates stand together. The
 * base module keeps refactored routes; this wrapper restores legacy roots and
 * keeps submitted-post route literals visible to route coverage.
 */
const createBaseRoutes = require('./_awtsmoos.posts.base.js');
const { getPostsInSeries, addPostToSeries, getSubmittedPosts, approveSubmittedPost, denySubmittedPost, er } = require('./helper/index.js');
const { installSocialDbBridge } = require('./helper/packed/socialDbBridgeInstaller.js');

function parseMap(value) { if (!value) return null; if (typeof value === 'object') return value; try { return JSON.parse(value); } catch { return null; } }
function get($i) { return $i.$_GET || {}; }
function post($i) { return $i.$_POST || {}; }
function props($i) { return parseMap(get($i).properties || get($i).propertyMap); }
function wantsDetails($i, forced = false) { return forced || get($i).details === 'true'; }
function rootPosts($i, heichelId, details = false) { return getPostsInSeries({ $i, heichelId, seriesId: 'root', withDetails: wantsDetails($i, details), properties: props($i) }); }
function rootWrite($i, heichelId) { if (!$i.$_POST) $i.$_POST = {}; $i.$_POST.seriesId = $i.$_POST.seriesId || 'root'; return addPostToSeries({ $i, heichelId, seriesId: $i.$_POST.seriesId }); }

module.exports = ({ $i, userid } = {}) => {
  installSocialDbBridge($i);
  const base = createBaseRoutes({ $i, userid });
  return {
    ...base,
    '/heichelos/:heichel/posts': async v => {
      if ($i.request.method === 'GET') return rootPosts($i, v.heichel);
      if ($i.request.method === 'POST') return rootWrite($i, v.heichel);
      return er({ code: 'METHOD_NOT_ALLOWED', method: $i.request.method });
    },
    '/heichelos/:heichel/posts/details': async v => {
      if ($i.request.method !== 'GET') return er({ code: 'METHOD_NOT_ALLOWED', method: $i.request.method });
      return rootPosts($i, v.heichel, true);
    },
    '/heichelos/:heichel/submittedPosts': async v => {
      if ($i.request.method !== 'GET') return er({ code: 'METHOD_NOT_ALLOWED' });
      return getSubmittedPosts({ $i, heichelId: v.heichel });
    },
    '/heichelos/:heichel/submittedPosts/approve': async v => {
      if ($i.request.method !== 'POST') return er({ code: 'METHOD_NOT_ALLOWED' });
      return approveSubmittedPost({ $i, heichelId: v.heichel, postId: post($i).postId, approverAliasId: post($i).aliasId, addPostToSeries });
    },
    '/heichelos/:heichel/submittedPosts/deny': async v => {
      if ($i.request.method !== 'POST' && $i.request.method !== 'DELETE') return er({ code: 'METHOD_NOT_ALLOWED' });
      const b = post($i) || $i.$_DELETE || {};
      return denySubmittedPost({ $i, heichelId: v.heichel, postId: b.postId, approverAliasId: b.aliasId });
    }
  };
};
