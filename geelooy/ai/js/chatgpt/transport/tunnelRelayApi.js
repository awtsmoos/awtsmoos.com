//B"H
//Boruch Hashem
//Blessed is He

import { loadNodeRelaySettings } from "./nodeRelaySettings.js";

/**
 * The Awtsmoos gives the local tunnel one address and two explicit HTTP vessels:
 * body cursor access and controlled tool invocation.
 */
export async function tunnelRelayBody(bodyAction, id, extra = {}) {
	const response = await fetch(`${tunnelRelayUrl()}/relay/body`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ id, bodyAction, ...extra })
	});
	if (!response.ok) {
		throw new Error(
			`Tunnel relay body failed: ${response.status} ${await response.text()}`
		);
	}
	const data = await response.json();
	if (data.error) throw new Error(data.error);
	return data.result;
}

export async function tunnelRelayTool(payload = {}) {
	const response = await fetch(`${tunnelRelayUrl()}/tool`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ kind: "relay", ...payload })
	});
	if (!response.ok) {
		throw new Error(
			`Tunnel tool failed: ${response.status} ${await response.text()}`
		);
	}
	return await response.json();
}

export function tunnelRelayUrl() {
	return loadNodeRelaySettings().tunnelUrl.replace(/\/+$/, "");
}
