// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Machine-readable headless OAuth flow for Awtsmoos Tunnel Control.
 * @description
 * The Awtsmoos lets a daemon without a callback receiver ask the human through
 * another browser; Awtsmoos.com records the exact request, verification, polling,
 * stopping, and immutable-route steps so an AI never invents its own cadence.
 */

const { oauth } = require("../docs/catalog.js");

function headlessDeviceFlow() {
	return {
		clientId: oauth.externalAgent.clientId,
		deviceAuthorizationEndpoint: oauth.deviceAuthorizationEndpoint,
		verificationUri: oauth.deviceVerificationUri,
		tokenEndpoint: oauth.tokenEndpoint,
		grantType: oauth.deviceGrantType,
		expiresIn: oauth.deviceExpiresIn,
		initialInterval: oauth.devicePollInterval,
		steps: [
			"POST client_id=external-agent and optional scope to the device authorization endpoint.",
			"Display verification_uri and user_code, or verification_uri_complete, to the human.",
			"Poll the normal token endpoint using the returned device_code, explicit client_id, and the standard device-code grant type.",
			"Wait at least the returned interval between polls; after slow_down, add the server's larger Retry-After interval before polling again.",
			"Continue on authorization_pending; stop on access_denied, expired_token, invalid_grant, or any other terminal OAuth error.",
			"After success, store access/refresh tokens securely and call my-device with Bearer authentication.",
			"Use routeReference when present, otherwise tunnelId, as the immutable routing value in the action field named tunnelName."
		],
		pollErrors: {
			authorization_pending: "The human has not decided yet; continue at or below the permitted polling rate.",
			slow_down: "Polling was too fast; increase the delay before subsequent requests.",
			access_denied: "The human denied this device request; stop polling.",
			expired_token: "The short-lived device authorization expired; start a new device request."
		}
	};
}

module.exports = {
	headlessDeviceFlow
};
