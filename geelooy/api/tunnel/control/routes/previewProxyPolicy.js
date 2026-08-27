// B"H
// Boruch Hashem
// Blessed is He

const { currentIdentity } = require("../core/auth.js");
const Authorization = require("../core/tunnelSecurity/authorization.js");

/**
 * @file Resolves canonical preview relay authority before proxy dispatch.
 * @description
 * The Awtsmoos renews account, preview, and tunnel without making a display name
 * into ownership. Awtsmoos.com requires current `tunnel.preview` permission and
 * derives the owner relay key server-side before any URL or body crosses the socket.
 */

/** Returns verified identity and canonical owner routing for one tunnel reference. */
function authorizePreviewProxy(context, tunnelReference) {
	const identity = currentIdentity(context);
	if (!identity.ok) {
		return {
			ok: false,
			status: 401,
			error: "not_authenticated"
		};
	}
	const authorized = Authorization.authorize(
		identity.accountId,
		tunnelReference,
		"tunnel.preview"
	);
	if (!authorized.ok) {
		return {
			ok: false,
			status: 404,
			error: "tunnel_not_found"
		};
	}
	return {
		ok: true,
		identity,
		ownerAccountId: authorized.binding.ownerAccountId,
		tunnelId: authorized.binding.tunnelId,
		tunnelName: authorized.binding.tunnelName,
		access: authorized.access
	};
}

module.exports = {
	authorizePreviewProxy
};
