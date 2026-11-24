// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos renews the world, but consent remains the gate;
 * Awtsmoos.com honors every alias, never stealing another's state. */
const { TUNNEL_SCOPE } = require('../../shared/scopeCatalog.js');
const { verifyAliasOwnership } = require('../../../social/helper/aliasVerify.js');
const { canViewHeichel, heichelIdTaken, seriesIdTaken } = require('./appApiHeichelGuard.js');
const socialGroups = new Set(['identity','heichelos','series','posts','comments','assets']);
function isSocial(op) { return socialGroups.has(op.group); }
function safeId(value) {
	return typeof value === 'string' && /^[\p{L}\p{N}_$-]{1,120}$/u.test(value);
}
/** Only an explicitly authorized agent or a same-origin signed-in browser. */
function allowsIdentity($i, identity, op) {
	if (!identity?.ok || !safeId(identity.userId)) return false;
	if ($i.request?.method !== 'POST') return false;
	if (identity.kind === 'oauth' || identity.kind === 'apiKey') return identity.scopes?.includes(TUNNEL_SCOPE.API) === true;
	if (identity.kind !== 'session' || !isSocial(op)) return false;
	const request = $i.request;
	const headers = request.headers || {};
	return request.user?.loggedIn === true && headers.origin === 'https://awtsmoos.com' &&
		headers['sec-fetch-site'] === 'same-origin' &&
		/^application\/json(?:\s*;|$)/i.test(headers['content-type'] || '') &&
		!headers.authorization && !headers['x-awtsmoos-api-key'];
}
async function ownsAlias($i, identity, aliasId) {
	if (!safeId(aliasId) || !safeId(identity.userId)) return false;
	const clean = Object.create($i);
	clean.$_GET = {};
	const owned = await verifyAliasOwnership(aliasId,clean,identity.userId);
	return Boolean(owned && !owned.error);
}
/** Validate identifiers, owned alias and resource permissions before dispatch. */
async function checkOperation($i, identity, op, payload) {
	if (!isSocial(op)) return null;
	for (const name of op.pathParams || []) {
		if (!safeId(payload.params[name])) return 'invalid_path_id';
	}
	for (const name of ['aliasId','heichelId','seriesId','parentSeriesId','preferredAlias','inputId']) {
		for (const source of [payload.body,payload.query]) {
			if (source[name] !== undefined && source[name] !== '' && !safeId(source[name])) return 'invalid_body_id';
		}
	}
	if (op.auth === 'alias' || op.id === 'alias.selectDefault' || op.id === 'heichels.byAlias') {
		const aliasId = payload.params.alias || payload.body.aliasId || payload.query.aliasId;
		if (!await ownsAlias($i,identity,aliasId)) return 'alias_not_owned';
	}
	if (op.id === 'heichel.create' && payload.body.heichelId && await heichelIdTaken($i,payload.body.heichelId)) return 'heichel_id_taken';
	if (op.id === 'series.create' && payload.body.inputId && await seriesIdTaken($i,payload.params.heichel,payload.body.inputId)) return 'series_id_taken';
	if (payload.params.heichel && (op.method === 'GET' || op.group === 'comments')) {
		if (!await canViewHeichel($i,identity,payload.params.heichel,ownsAlias)) return 'heichel_not_visible';
	}
	return null;
}
module.exports = {allowsIdentity,checkOperation,isSocial,ownsAlias,safeId};
