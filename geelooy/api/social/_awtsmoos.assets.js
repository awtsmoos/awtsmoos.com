// B"H
/**
 * @module SocialAssetRoutes
 * @description
 * Chapter 182: Routes for alias-owned binary uploads, public serving, and
 * binding images/audio/GIFs into root posts, verses, subsections, comments,
 * comment sections, series covers, and Heichel navigation cards.
 */

const { er } = require('./helper/general.js');
const { uploadAssets, listAssets, getAssetManifest, serveAsset } = require('./helper/assets/assetUpload.js');
const { bindAsset } = require('./helper/assets/assetBindings.js');

function needs($i, method) { return $i.request.method === method ? null : er({ code: 'BAD_METHOD', message: `Use ${method}.` }); }
function targetFromBody($i) { try { return typeof $i.$_POST.target === 'string' ? JSON.parse($i.$_POST.target) : ($i.$_POST.target || $i.$_POST || {}); } catch { return $i.$_POST || {}; } }

module.exports = ({ $i, userid } = {}) => ({
  '/assets/:alias/upload': async vars => {
    const bad = needs($i, 'POST');
    if (bad) return bad;
    return await uploadAssets({ $i, userid, aliasId: vars.alias });
  },
  '/assets/:alias': async vars => {
    const bad = needs($i, 'GET');
    if (bad) return bad;
    return await listAssets({ $i, aliasId: vars.alias });
  },
  '/assets/:alias/:asset/bind': async vars => {
    const bad = needs($i, 'POST');
    if (bad) return bad;
    return await bindAsset({ $i, aliasId: vars.alias, assetId: vars.asset, target: targetFromBody($i), role: $i.$_POST.role || 'inline' });
  },
  '/assets/:alias/manifest/:asset': async vars => {
    const bad = needs($i, 'GET');
    if (bad) return bad;
    return await getAssetManifest({ $i, aliasId: vars.alias, assetId: vars.asset });
  },
  '/assets/:alias/:kind/:asset': async vars => {
    const bad = needs($i, 'GET');
    if (bad) return bad;
    return await serveAsset({ $i, aliasId: vars.alias, assetId: vars.asset, kind: vars.kind });
  }
});
