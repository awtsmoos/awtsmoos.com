// B"H
const { getUserId } = require('../../oauth/core/currentUser.js');
const { config, missingConfig, normalizeMode } = require('../core/config.js');
const { authorizationUrl, exchangeCode, revokeToken, userInfo } = require('../core/googleOAuth.js');
const { currentIdentity } = require('../core/identity.js');
const { fail, ok, redirect } = require('../core/json.js');
const { assertSameOrigin } = require('../core/origin.js');
const { clearSession, createOAuthState, safeReturnTo, setSession, verifyOAuthState } = require('../core/session.js');
const { deleteConnection, saveConnection } = require('../core/tokenStore.js');

async function start($i) {
	const missing = missingConfig();
	if (missing.length) return fail('youtube_not_configured', 503, { missing });
	const mode = normalizeMode($i.$_GET?.mode);
	const state = createOAuthState($i, {
		mode,
		returnTo: safeReturnTo($i.$_GET?.returnTo),
		awtsmoosUserId: getUserId($i)
	});
	return redirect(authorizationUrl(state, mode));
}

async function callback($i) {
	const query = $i.$_GET || {};
	const state = verifyOAuthState($i, query.state);
	if (!state) return fail('invalid_oauth_state', 400);
	if (query.error) return redirect(withResult(state.returnTo, 'error', query.error));
	if (!query.code) return fail('missing_authorization_code', 400);
	const token = await exchangeCode(query.code);
	const profile = await userInfo(token.access_token);
	await saveConnection({ profile, token, awtsmoosUserId: state.awtsmoosUserId });
	setSession($i, profile.sub);
	return redirect(withResult(state.returnTo, 'connected'));
}

async function status($i) {
	const missing = missingConfig();
	const identity = await currentIdentity($i);
	return ok({
		configured: missing.length === 0,
		missing,
		connected: Boolean(identity),
		profile: identity?.connection.profile || null,
		scopes: String(identity?.connection.token?.scope || '').split(' ').filter(Boolean),
		redirectUri: config().redirectUri
	});
}

async function logout($i) {
	assertSameOrigin($i);
	const identity = await currentIdentity($i);
	if (identity) {
		const token = identity.connection.token || {};
		await revokeToken(token.refresh_token || token.access_token).catch(() => null);
		await deleteConnection(identity.sub);
	}
	clearSession($i);
	return ok({ connected: false });
}

function withResult(returnTo, state, reason = '') {
	const url = new URL(returnTo, 'https://awtsmoos.com');
	url.searchParams.set('youtube', state);
	if (reason) url.searchParams.set('reason', reason);
	return `${url.pathname}${url.search}${url.hash}`;
}

module.exports = { callback, logout, start, status };
