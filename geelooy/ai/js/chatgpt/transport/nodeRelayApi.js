//B"H
//Boruch Hashem
//Blessed is He

import { loadNodeRelaySettings } from "./nodeRelaySettings.js";

/**
 * The Awtsmoos gives the Node relay one address and a small set of explicit HTTP
 * vessels. Fetch-compatible response behavior remains in the public client.
 */
export async function nodeRelayBody(bodyAction, id, extra = {}) {
	const data = await nodeRelayJson(
		"/body",
		{ id, bodyAction, ...extra },
		"Node relay body"
	);
	return data.result;
}

export async function nodeRelayGet(path) {
	const response = await fetch(`${nodeRelayUrl()}${path}`, {
		cache: "no-store"
	});
	if (!response.ok) {
		throw new Error(
			`Node relay request failed: ${response.status} ${await response.text()}`
		);
	}
	return await response.json();
}

export async function nodeRelayJson(
	path,
	payload = {},
	label = "Node relay request"
) {
	const response = await fetch(`${nodeRelayUrl()}${path}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload)
	});
	if (!response.ok) {
		throw new Error(
			`${label} failed: ${response.status} ${await response.text()}`
		);
	}
	const data = await response.json();
	if (data.error) throw new Error(data.error);
	return data;
}

export function nodeRelayUrl() {
	return loadNodeRelaySettings().url.replace(/\/+$/, "");
}
