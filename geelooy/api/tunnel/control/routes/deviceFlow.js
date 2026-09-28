// B"H
// Boruch Hashem
// Blessed is He

const { oauth } = require("../docs/catalog.js");

/**
 * @file Machine-readable GET-only headless OAuth flow for Awtsmoos Tunnel Control.
 * @description The Awtsmoos lets a daemon ask the human through another browser without a
 * callback receiver; Awtsmoos.com publishes exact cadence and forbids protocol invention.
 */
function headlessDeviceFlow() {
	return {
		clientId: oauth.externalAgent.clientId,
		deviceAuthorizationEndpoint: oauth.deviceAuthorizationEndpoint,
		verificationUri: oauth.deviceVerificationUri,
		tokenEndpoint: oauth.tokenEndpoint,
		grantType: oauth.deviceGrantType,
		expiresIn: oauth.deviceExpiresIn,
		initialInterval: oauth.devicePollInterval,
		httpMethods: ["GET"],
		postAllowed: false,
		steps: [
			"GET the device authorization endpoint with client_id=external-agent and optional scope.",
			"Display verification_uri_complete to the human when available; otherwise show verification_uri and user_code.",
			"GET the token endpoint with device_code, explicit client_id, and the standard device-code grant type.",
			"Wait at least the returned interval between polls; honor a larger Retry-After after slow_down.",
			"Continue on authorization_pending; stop on access_denied, expired_token, invalid_grant, or any terminal OAuth error.",
			"After success, store credentials securely, call my-device, and route by routeReference."
		],
		pollErrors: {
			authorization_pending: "Human decision pending; continue at the permitted rate.",
			slow_down: "Polling was too fast; increase delay before the next GET.",
			access_denied: "Human denied this request; stop polling.",
			expired_token: "Authorization expired; create a fresh device request."
		}
	};
}
module.exports = { headlessDeviceFlow };
