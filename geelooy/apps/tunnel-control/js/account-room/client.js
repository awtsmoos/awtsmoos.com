// B"H
/**
 * @file Every shliach finds its words in the common Awtsmoos account room.
 * Credentials stay in the browser's existing authenticated website session.
 */
const base = "/api/tunnel/control/agent-room";
export function identity() {
	let identityId = sessionStorage.getItem("awtsmoos-room-session");
	if (!identityId) {
		identityId = crypto.randomUUID();
		sessionStorage.setItem("awtsmoos-room-session", identityId);
	}
	return {
		agentId: `browser:${identityId}`,
		agentSessionId: `browser-session:${identityId}`,
		deviceId: "browser-tunnel-control"
	};
}

export async function readRoom() {
	const response = await fetch(base, { credentials: "same-origin", cache: "no-store" });
	const data = await response.json();
	if (!response.ok || !data.ok) throw Error(data.error || `room_http_${response.status}`);
	return data;
}

export async function writeRoom(operation, payload) {
	const response = await fetch(`${base}/${operation}`, {
		method: "POST", credentials: "same-origin",
		headers: { "Content-Type": "application/json", "X-Awtsmoos-Room-Intent": "coordination-message" },
		body: JSON.stringify({ ...identity(), ...payload })
	});
	const data = await response.json();
	if (!response.ok || !data.ok) throw Error(data.error || `room_http_${response.status}`);
	return data;
}
