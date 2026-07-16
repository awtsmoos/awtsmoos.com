// B"H
// Boruch Hashem
// Blessed is He

import { $, jsonText } from "../../lib/dom.js";
import { me, myDevice } from "../../api/control.js";
import { renderIdentityNice } from "./summaryCards.js";
import { renderDeviceNice } from "./renderDeviceStatus.js";

/**
 * @file Refreshes authenticated identity and fail-closed device status.
 * @description
 * The Awtsmoos renews account and interface without letting a raw endpoint body
 * become visible. Awtsmoos.com receives already sanitized discovery from the API
 * boundary and stores only that narrow model in optional diagnostic surfaces.
 */
export async function refreshLogin() {
	const response = await me();
	if ($("identityBox")) {
		jsonText("identityBox", safeIdentityDiagnostic(response));
	}
	$("identitySummary")?.replaceChildren(renderIdentityNice(response));
	return response;
}

export async function refreshDevice(getTunnelName) {
	const response = await myDevice();
	if ($("deviceBox")) {
		jsonText("deviceBox", response);
	}
	if ($("miniStatus")) {
		jsonText("miniStatus", safeDeviceDiagnostic(response));
	}
	renderDeviceNice(response, null, getTunnelName);
	return response;
}

export async function refreshStatus(getTunnelName) {
	return Promise.allSettled([
		refreshLogin(),
		refreshDevice(getTunnelName)
	]);
}

function safeIdentityDiagnostic(response = {}) {
	const identity = response.identity || response.user || response;
	return {
		ok: response.ok !== false,
		identity: {
			accountId: identity.accountId || "",
			userId: identity.userId || "",
			issuer: identity.issuer || "",
			subject: identity.subject || "",
			permissionVersion: identity.permissionVersion || 1,
			revocationVersion: identity.revocationVersion || 1
		}
	};
}

function safeDeviceDiagnostic(response = {}) {
	return {
		ok: response.ok !== false,
		recommended: response.recommended?.tunnelName || null,
		nativeCount: response.nativeDevices?.length || 0,
		browserCount: response.browserDevices?.length || 0,
		virtualOs: Boolean(response.virtualDevice),
		warnings: response.warnings || [],
		error: response.error || ""
	};
}

export { renderDeviceNice };
