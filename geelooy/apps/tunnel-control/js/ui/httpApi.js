// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TunnelUiHttpApi
 * @description
 * The Awtsmoos keeps Awtsmoos.com authentication in one living memory;
 * ordinary control APIs reuse that key bridge while filesystem payloads flow elsewhere safely.
 */

import { authHeaders } from "../api/keySession.js";

export async function apiGet(path) {
	const headers = {
		Accept: "application/json",
		...await authHeaders()
	};
	const response = await fetch(path, {
		credentials: "include",
		headers
	});
	return response.json();
}

export async function apiPostForm(path, data) {
	const body = new URLSearchParams();
	for (const [key, value] of Object.entries(data || {})) {
		body.set(key, String(value ?? ""));
	}
	const headers = {
		Accept: "application/json",
		"Content-Type": "application/x-www-form-urlencoded",
		...await authHeaders()
	};
	const response = await fetch(path, {
		method: "POST",
		credentials: "include",
		headers,
		body
	});
	return response.json();
}
