//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * A room frame has no independent continuity. In every instant the Awtsmoos,
 * Atzmus beyond form and division, renews sender, wire, parser, and receiver.
 * This module gives that renewed light a truthful keli: one explicit envelope
 * that Awtsmoos.com can validate without pretending legacy frames are modern.
 */

export const ROOM_PROTOCOL_VERSION = 1;

/**
 * Parses one WebSocket or EventSource frame into a normalized room envelope.
 *
 * @param {string|object} rawFrame
 * 	The serialized or already parsed frame received from the transport.
 * @param {string} expectedMissionId
 * 	The selected mission whose events may enter the room state.
 * @returns {{ok: boolean, envelope?: object, reason?: string}}
 * 	A validated envelope or a precise rejection reason.
 */
export function parseRoomFrame(rawFrame, expectedMissionId = "") {
	const parsedFrame = parseJsonValue(rawFrame);
	if (!parsedFrame || typeof parsedFrame !== "object" || Array.isArray(parsedFrame)) {
		return { ok: false, reason: "malformed-frame" };
	}

	const payload = objectValue(parsedFrame.event)
		|| objectValue(parsedFrame.frame)
		|| parsedFrame;
	const missionId = firstText(
		parsedFrame.missionId,
		parsedFrame.roomId,
		parsedFrame.room,
		payload.missionId,
		payload.roomId
	);

	if (missionId && expectedMissionId && missionId !== expectedMissionId) {
		return { ok: false, reason: "room-mismatch" };
	}

	return {
		ok: true,
		envelope: {
			protocolVersion: finiteNumber(parsedFrame.protocolVersion) ?? 0,
			eventId: firstText(parsedFrame.eventId, parsedFrame.id, payload.eventId, payload.id)
				|| legacyEventId(payload),
			requestId: firstText(parsedFrame.requestId, payload.requestId),
			correlationId: firstText(parsedFrame.correlationId, payload.correlationId),
			missionId: missionId || expectedMissionId,
			roomId: firstText(parsedFrame.roomId, payload.roomId, missionId),
			sequence: finiteNumber(parsedFrame.sequence ?? payload.sequence),
			serverTimestamp: firstText(parsedFrame.serverTimestamp, payload.serverTimestamp),
			clientTimestamp: firstText(parsedFrame.clientTimestamp, payload.clientTimestamp),
			resumeToken: firstText(parsedFrame.resumeToken, payload.resumeToken),
			type: firstText(parsedFrame.type, parsedFrame.kind, payload.type, payload.kind, "event"),
			payload
		}
	};
}

/**
 * Creates stable identity for legacy frames that omit an event identifier.
 *
 * @param {object} payload
 * 	The legacy event body whose content must be deduplicated.
 * @returns {string}
 * 	A deterministic identifier scoped to the serialized payload.
 */
export function legacyEventId(payload = {}) {
	const serialized = stableStringify(payload);
	let hash = 2166136261;
	for (const character of serialized) {
		hash ^= character.charCodeAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return `legacy_${(hash >>> 0).toString(36)}`;
}

function parseJsonValue(value) {
	if (typeof value !== "string") {
		return value;
	}
	try {
		return JSON.parse(value);
	} catch {
		return null;
	}
}

function stableStringify(value) {
	if (!value || typeof value !== "object") {
		return JSON.stringify(value);
	}
	if (Array.isArray(value)) {
		return `[${value.map(stableStringify).join(",")}]`;
	}
	const keys = Object.keys(value).sort();
	return `{${keys.map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
}

function objectValue(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function firstText(...values) {
	return String(values.find(value => value !== undefined && value !== null && value !== "") || "");
}

function finiteNumber(value) {
	const number = Number(value);
	return Number.isFinite(number) && number >= 0 ? number : null;
}
