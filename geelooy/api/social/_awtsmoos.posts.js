// B"H
/**
 * @module SocialPostsCompatibilityRoutes
 * @description
 * Chapter 613: The old post gate remains open, yet it no longer forgets the
 * chamber named in the query string. Root is still root for ancient callers;
 * seriesId, parentSeriesId, or series now guide the request into its true
 * vessel, where the Awtsmoos speaks every post from its actual shelf.
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
function cleanSeriesId(value) { const id = String(value || '').trim(); return !id || id === 'undefined' || id === 'null' ? 'root' : id; }
function requestedSeriesId($i) { const q = get($i); return cleanSeriesId(q.seriesId || q.parentSeriesId || q.series); }
function postsInRequestedSeries($i, heichelId, details = false) { return getPostsInSeries({ $i, heichelId, seriesId: requestedSeriesId($i), withDetails: wantsDetails($i, details), properties: props($i) }); }
function rootWrite($i, heichelId) { if (!$i.$_POST) $i.$_POST = {}; $i.$_POST.seriesId = cleanSeriesId($i.$_POST.seriesId || $i.$_POST.parentSeriesId); return addPostToSeries({ $i, heichelId, seriesId: $i.$_POST.seriesId }); }
function bad($i, allowed) { return methodNotAllowed($i?.request?.method, allowed); }

module.exports = ({ $i, userid } = {}) => {
  installSocialDbBridge($i);
  const base = createBaseRoutes({ $i, userid });
  return {
    ...base,
    '/heichelos/:heichel/posts': async v => {
      if ($i.request.method === 'GET') return postsInRequestedSeries($i, v.heichel);
      if ($i.request.method === 'POST') return rootWrite($i, v.heichel);
      return bad($i, ['GET', 'POST']);
    },
    '/heichelos/:heichel/posts/details': async v => {
      if ($i.request.method !== 'GET') return bad($i, ['GET']);
      return postsInRequestedSeries($i, v.heichel, true);
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
