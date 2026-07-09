// B"H
/**
 * @module SocialSeriesCompatibilityRoutes
 * @description Old series vessels are restored without erasing the new API.
 * Alternate groupings are full UI records beside the canonical tree.
 */
const createBaseRoutes = require('./_awtsmoos.series.base.js');
const { getAlternateGroups } = require('./helper/series/virtualSeries.js');
const { makeNewSeries, editSeriesDetails, getSeries, getSubSeries, deleteSeriesFromHeichel, changeSubSeriesFromOneSeriesToAnother, editSubSeriesInSeries, addPostToSeries, deletePostFromSeries, er } = require('./helper/index.js');

function body($i) { return $i.$_POST || $i.$_PUT || $i.$_DELETE || {}; }
function alias($i) { return body($i).aliasId || $i.$_GET?.aliasId; }
function ids(value) { return Array.isArray(value) ? value : String(value || '').split(',').filter(Boolean); }
function parent($i) { return body($i).parentSeriesId || body($i).seriesId || $i.$_GET?.parentSeriesId || 'root'; }
function isPostLike($i) { const b = body($i); return b.postId || b.title || b.content || b.dayuh || b.type === 'post'; }
function seriesDetails($i, h, s = 'root') { return getSeries({ $i, heichelId: h, seriesId: s, withDetails: true }); }
function subSeries($i, h, s = 'root', withDetails = false) { return getSubSeries({ $i, heichelId: h, parentSeriesId: s, withDetails }); }
function deleteSeriesCompat($i, h, seriesId, p = 'root') { return deleteSeriesFromHeichel({ $i, heichelId: h, seriesId, parentSeriesId: p, userid: $i.userid }); }
function addContent($i, h) { if (!$i.$_POST) $i.$_POST = {}; $i.$_POST.parentSeriesId = parent($i); $i.$_POST.seriesId = $i.$_POST.seriesId || $i.$_POST.parentSeriesId; return isPostLike($i) ? addPostToSeries({ $i, heichelId: h, seriesId: $i.$_POST.seriesId }) : makeNewSeries({ $i, heichelId: h }); }
function deleteContent($i, h) { const b = body($i); const p = b.parentSeriesId || b.seriesId || 'root'; if (b.postId || b.type === 'post') return deletePostFromSeries({ $i, heichelId: h, seriesId: p, postId: b.postId, userid: $i.userid }); return deleteSeriesCompat($i, h, b.subSeriesId || b.seriesId || b.id, p); }
function alternateGroups($i, heichelId, seriesId) { return getAlternateGroups({ $i, heichelId, seriesId, withDetails: true }); }

module.exports = ({ $i, userid } = {}) => {
  const base = createBaseRoutes({ $i, userid });
  return {
    ...base,
    '/heichelos/:heichel/series/details': async v => seriesDetails($i, v.heichel, 'root'),
    '/heichelos/:heichel/series/root': async v => seriesDetails($i, v.heichel, 'root'),
    '/heichelos/:heichel/series/root/details': async v => seriesDetails($i, v.heichel, 'root'),
    '/heichelos/:heichel/series/root/subSeries': async v => subSeries($i, v.heichel, 'root', $i.$_GET?.details === 'true'),
    '/heichelos/:heichel/series/root/subSeries/details': async v => subSeries($i, v.heichel, 'root', true),
    '/heichelos/:heichel/series/root/breadcrumb': async () => [{ id: 'root', name: 'Root' }],
    '/heichelos/:heichel/series/:series/alternateGroups': async v => alternateGroups($i, v.heichel, v.series),
    '/heichelos/:heichel/series/:series/alternateGroups/details': async v => alternateGroups($i, v.heichel, v.series),
    '/heichelos/:heichel/addContentToSeries': async v => { if ($i.request.method !== 'POST') return er({ code: 'METHOD_NOT_ALLOWED' }); return addContent($i, v.heichel); },
    '/heichelos/:heichel/deleteContentFromSeries': async v => deleteContent($i, v.heichel),
    '/heichelos/:heichel/deleteSeriesFromHeichel/:seriesId': async v => deleteSeriesCompat($i, v.heichel, v.seriesId, $i.$_GET?.parentSeriesId || body($i).parentSeriesId || 'root'),
    '/heichelos/:heichel/series/:series/editSeriesDetails': async v => editSeriesDetails({ $i, heichelId: v.heichel, seriesId: v.series }),
    '/heichelos/:heichel/series/:series/changePostsInSeries': async v => ({ success: { kept: true, route: 'compat', seriesId: v.series, postIds: ids(body($i).postIDs || body($i).postIds) } }),
    '/heichelos/:heichel/series/:series/changeSubSeriesInSeries': async v => editSubSeriesInSeries({ $i, heichelId: v.heichel, seriesId: v.series, aliasId: alias($i) }),
    '/heichelos/:heichel/series/:seriesFrom/changeSubSeriesFromOneSeriesToAnother/:seriesTo': async v => changeSubSeriesFromOneSeriesToAnother({ $i, heichelId: v.heichel, seriesFrom: v.seriesFrom, seriesTo: v.seriesTo, aliasId: alias($i) })
  };
};
