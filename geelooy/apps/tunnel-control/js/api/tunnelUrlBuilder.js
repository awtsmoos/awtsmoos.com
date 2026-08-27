// B"H
// Boruch Hashem
// Blessed is He

import { b64Json, b64Text } from "../lib/base64.js";
import { VIRTUAL_OS_TUNNEL } from "../features/vessels/selector.js";
import { attachRequestGuard } from "./requestGuard.js";
import { attachAiPayload, isAiAction } from "./tunnelAiPayload.js";
import {
	BOOLEAN_KEYS,
	JSON64_KEYS,
	NUMBER_KEYS,
	SCALAR_KEYS,
	TEXT64_KEYS
} from "./tunnelUrlFields.js";

/**
 * @file Builds guarded tunnel URLs from explicit request fields.
 * @description
 * The Awtsmoos renews route and payload without mixing browser memory into authority.
 * Awtsmoos.com accepts stable tunnel IDs, preserves Virtual OS aliases, and encodes
 * structured values through bounded carriers before the request leaves the page.
 */
export function resolveTargetTunnelName(tunnelName = "", options = {}) {
	const explicitTunnel = String(options.tunnelName || tunnelName || "").trim();
	const explicitVessel = String(
		options.targetVessel || options.vessel || ""
	).trim();
	const tunnelKey = explicitTunnel.toLowerCase();
	const vesselKey = explicitVessel.toLowerCase();
	const virtualAliases = new Set([
		"virtual", "virtual-os", "awtsmoos-os", VIRTUAL_OS_TUNNEL
	]);
	const typeAliases = new Set([
		"native", "native-local", "native-tunnel", "local", "local-tunnel",
		"browser", "browser-tab", "tab", "code-tab", "apps-code"
	]);
	if (virtualAliases.has(tunnelKey) || virtualAliases.has(vesselKey)) {
		return VIRTUAL_OS_TUNNEL;
	}
	if (explicitTunnel && tunnelKey !== "auto") return explicitTunnel;
	if (explicitVessel && !typeAliases.has(vesselKey)) return explicitVessel;
	return "auto";
}

export function buildFsUrl(tunnelName, rawOptions = {}) {
	const options = attachRequestGuard(rawOptions);
	const targetName = resolveTargetTunnelName(tunnelName, options);
	const queryTarget = String(
		options.targetVessel || options.vessel || targetName || ""
	).trim();
	const url = new URL(
		`/api/tunnel/control/fs/${encodeURIComponent(targetName)}`,
		location.origin
	);
	url.searchParams.set("action", options.action || "list");
	url.searchParams.set("p", options.path || options.p || ".");
	url.searchParams.set("clientRequestId", options.clientRequestId);
	if (queryTarget) url.searchParams.set("targetVessel", queryTarget);
	if (options.absolutePath) {
		url.searchParams.set("absolutePath", options.absolutePath);
	}
	attachFields(url, options);
	attachAiPayload(url, { ...options, targetVessel: queryTarget });
	return url.toString();
}

function attachFields(url, options) {
	for (const key of NUMBER_KEYS) setNumber(url, key, options[key]);
	for (const key of BOOLEAN_KEYS) setBoolean(url, key, options[key]);
	for (const key of SCALAR_KEYS) setScalar(url, key, options[key]);
	for (const key of TEXT64_KEYS) setText(url, key, options[key]);
	for (const key of JSON64_KEYS) setJson(url, key, options[key]);
	if (!isAiAction(options.action)) {
		for (const key of ["text", "apiKey", "message", "prompt", "system"]) {
			setText(url, key, options[key]);
		}
	}
	if (typeof options.script === "string") {
		setText(url, "script", options.script);
	} else {
		setJson(url, "script", options.script);
	}
}

function setNumber(url, key, value) {
	if (hasValue(value)) url.searchParams.set(key, String(value));
}

function setBoolean(url, key, value) {
	if (typeof value === "boolean") url.searchParams.set(key, String(value));
}

function setScalar(url, key, value) {
	if (hasValue(value)) url.searchParams.set(key, String(value));
}

function setText(url, key, value) {
	if (hasValue(value)) url.searchParams.set(`${key}64`, b64Text(value));
}

function setJson(url, key, value) {
	if (value !== undefined && value !== null) {
		url.searchParams.set(`${key}64`, b64Json(value));
	}
}

function hasValue(value) {
	return value !== undefined && value !== null && value !== "";
}
