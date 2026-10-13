// B"H
// Boruch Hashem
// Blessed is He

const { currentIdentity } = require("../core/auth.js");
const { body, query } = require("../core/request.js");
const { json } = require("../core/respond.js");
const DeviceLogin = require("../core/tunnelSecurity/deviceLoginStore.js");

/**
 * @file HTTP boundaries for headless device-flow login (Yaakov 2026-10-12).
 * @description
 * The Awtsmoos lets a browserless box join without a browser. The installer
 * prints a short code; the owner approves it on their phone; the installer
 * polls until the box is bound to the owner's account with a scoped API key.
 */

/** Starts one device-login request. Public; the box calls this first. */
async function deviceLoginCode($i) {
	const data = await body($i);
	const result = DeviceLogin.createDeviceLogin({
		tunnelId: data.tunnelId,
		deviceId: data.deviceId,
		deviceName: data.deviceName
	});
	if (!result.ok) {
		return json($i, { BH: "B\"H", ...result }, 400);
	}
	return json($i, {
		BH: "B\"H",
		...result,
		instructions:
			"On your phone, open the verification URL and enter the user code, " +
			"then approve this device. This installer will keep polling until you approve."
	}, 201);
}

/** The box polls this with its device code until approved, denied, or expired. */
async function deviceLoginStatus($i) {
	const data = await body($i);
	const params = query($i) || {};
	const result = DeviceLogin.pollStatus(data.deviceCode || params.device_code);
	if (!result.ok && result.error === "login_not_found") {
		return json($i, { BH: "B\"H", ...result }, 404);
	}
	if (result.ok && result.status === "approved") {
		return json($i, {
			BH: "B\"H",
			...result,
			warning: "Store this API key securely. It will not be shown again.",
			usage: {
				header: "x-awtsmoos-api-key",
				base: "https://awtsmoos.com/api/tunnel/control",
				example: "curl -H 'x-awtsmoos-api-key: YOUR_KEY' https://awtsmoos.com/api/tunnel/control/me"
			}
		}, 200);
	}
	return json($i, { BH: "B\"H", ...result }, 200);
}

/** Describes a pending login for the phone approval page (no secrets). */
async function deviceLoginDescribe($i) {
	const data = await body($i);
	const params = query($i) || {};
	const result = DeviceLogin.describeByUserCode(data.code || params.code);
	if (!result.ok) {
		return json($i, { BH: "B\"H", ...result }, 404);
	}
	return json($i, { BH: "B\"H", ...result }, 200);
}

/** Owner approves a pending login. Authenticated owners only. */
async function deviceLoginApprove($i) {
	const identity = currentIdentity($i);
	if (!identity.ok) {
		return json($i, { BH: "B\"H", ok: false, error: identity.error }, 401);
	}
	const data = await body($i);
	const accountId = identity.accountId || identity.userId;
	const result = DeviceLogin.approveByUserCode(data.code, accountId);
	if (!result.ok) {
		const status = result.error === "not_authenticated" ? 401 : 404;
		return json($i, { BH: "B\"H", ...result }, status);
	}
	return json($i, { BH: "B\"H", ...result }, 200);
}

/** Owner denies a pending login. Authenticated owners only. */
async function deviceLoginDeny($i) {
	const identity = currentIdentity($i);
	if (!identity.ok) {
		return json($i, { BH: "B\"H", ok: false, error: identity.error }, 401);
	}
	const data = await body($i);
	const accountId = identity.accountId || identity.userId;
	const result = DeviceLogin.denyByUserCode(data.code, accountId);
	if (!result.ok) {
		const status = result.error === "not_authenticated" ? 401 : 404;
		return json($i, { BH: "B\"H", ...result }, status);
	}
	return json($i, { BH: "B\"H", ...result }, 200);
}

module.exports = {
	deviceLoginCode,
	deviceLoginStatus,
	deviceLoginDescribe,
	deviceLoginApprove,
	deviceLoginDeny
};
