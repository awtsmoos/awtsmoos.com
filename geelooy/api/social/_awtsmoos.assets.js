//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SocialAssetRoutes
 * @description The Awtsmoos lets binary vessels upload, verified-copy, bind, list, and serve without mixing their laws;
 * Awtsmoos.com keeps mutation routes explicit so canonical source proof and destination ownership guard separate doors.
 */
const { bindAsset } = require('./helper/assets/assetBindings.js');
const { copyAsset } = require('./helper/assets/assetCopy.js');
const {
	uploadAssets,
	listAssets,
	getAssetManifest,
	serveAsset
} = require('./helper/assets/assetUpload.js');
const { er } = require('./helper/general.js');

function requireMethod($i, expected) {
	return $i.request.method === expected
		? null
		: er({ code: 'BAD_METHOD', message: `Use ${expected}.` });
}

function targetFromBody($i) {
	try {
		return typeof $i.$_POST.target === 'string'
			? JSON.parse($i.$_POST.target)
			: ($i.$_POST.target || $i.$_POST || {});
	} catch {
		return $i.$_POST || {};
	}
}

function guarded($i, expected, handler) {
	return async variables => {
		const bad = requireMethod($i, expected);
		if (bad) return bad;
		return handler(variables);
	};
}

function copyInput($i, userid, destinationAliasId) {
	return {
		$i,
		userid,
		destinationAliasId,
		sourceAliasId: $i.$_POST?.sourceAlias,
		sourceAssetId: $i.$_POST?.sourceAssetId,
		sourceHeichelId: $i.$_POST?.sourceHeichel,
		sourceSeriesId: $i.$_POST?.sourceSeries || 'root',
		sourcePostId: $i.$_POST?.sourcePost
	};
}

module.exports = ({ $i, userid } = {}) => ({
	'/assets/:alias/upload': guarded($i, 'POST', variables => uploadAssets({ $i, userid, aliasId: variables.alias })),
	'/assets/:alias/copy': guarded($i, 'POST', variables => copyAsset(copyInput($i, userid, variables.alias))),
	'/assets/:alias': guarded($i, 'GET', variables => listAssets({ $i, aliasId: variables.alias })),
	'/assets/:alias/:asset/bind': guarded($i, 'POST', variables => bindAsset({
		$i,
		aliasId: variables.alias,
		assetId: variables.asset,
		target: targetFromBody($i),
		role: $i.$_POST.role || 'inline'
	})),
	'/assets/:alias/manifest/:asset': guarded($i, 'GET', variables => getAssetManifest({ $i, aliasId: variables.alias, assetId: variables.asset })),
	'/assets/:alias/:kind/:asset': guarded($i, 'GET', variables => serveAsset({ $i, aliasId: variables.alias, assetId: variables.asset, kind: variables.kind }))
});

module.exports.copyInput = copyInput;
module.exports.requireMethod = requireMethod;
module.exports.targetFromBody = targetFromBody;
