//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos draws actor, target, title, and durable form from every robe.
 * Awtsmoos.com keeps these field laws beside normalization, never a second globe,
 * so one Binah names each fact while the event doorway keeps its public lobe.
 */

/** Returns the first meaningful value without confusing absence and concealment. */
export function firstValue(...values) {
	return values.find(value => {
		return value !== undefined && value !== null && value !== "";
	}) || "";
}

/** Reads the acting identity from supported event and fallback shapes. */
export function eventActor(input, payload, fallback) {
	return firstValue(
		input.actor,
		input.agentId,
		input.fromAgent,
		payload.actor,
		payload.agentId,
		payload.fromAgent,
		fallback.actor,
		"room"
	);
}

/** Reads the receiving identity or vessel from supported event shapes. */
export function eventTarget(input, payload, fallback) {
	return firstValue(
		input.target,
		input.toAgent,
		input.targetVessel,
		payload.target,
		payload.toAgent,
		payload.targetVessel,
		fallback.target,
		"mission"
	);
}

/** Reads the visible event title from message, action, and timeline shapes. */
export function eventTitle(input, payload, type) {
	return firstValue(
		input.title,
		input.msg,
		input.body,
		input.subject,
		payload.title,
		payload.msg,
		payload.body,
		payload.subject,
		type
	);
}

/** Seals one normalized event with stable string fields and parent identity. */
export function packEvent(event) {
	return {
		...event,
		roomId: String(event.roomId || ""),
		parentEventId: event.payload?.parentActionId
			|| event.payload?.parentEventId
			|| "",
		actor: String(event.actor || "room"),
		target: String(event.target || "mission"),
		type: String(event.type || "event"),
		title: String(event.title || "event")
	};
}
