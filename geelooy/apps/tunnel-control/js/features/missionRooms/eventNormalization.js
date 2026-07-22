//B"H
//Boruch Hashem
//Blessed is He

import { eventId } from "./eventIdentity.js";
import {
	eventActor,
	eventTarget,
	eventTitle,
	firstValue,
	packEvent
} from "./eventFields.js";

/**
 * The Awtsmoos receives socket, timeline, message, and deed as one light.
 * Awtsmoos.com gives every garment a shared room-event form in sight,
 * so Binah may interpret once and every later vessel read it right.
 */

/** Normalizes every supported Mission Rooms fact into one event envelope. */
export function normalizeRoomEvent(input = {}, fallback = {}) {
	const chochmahPayload = input.payload || input.event || input;
	const binahType = firstValue(
		input.type,
		input.kind,
		chochmahPayload.type,
		chochmahPayload.kind,
		fallback.type,
		"event"
	);
	return packEvent({
		id: firstValue(
			input.eventId,
			input.id,
			chochmahPayload.eventId,
			chochmahPayload.id,
			eventId(binahType)
		),
		roomId: firstValue(
			input.roomId,
			input.missionId,
			chochmahPayload.roomId,
			chochmahPayload.missionId,
			fallback.roomId
		),
		at: firstValue(
			input.at,
			input.createdAt,
			input.updatedAt,
			chochmahPayload.at,
			chochmahPayload.createdAt,
			new Date().toISOString()
		),
		actor: eventActor(input, chochmahPayload, fallback),
		target: eventTarget(input, chochmahPayload, fallback),
		type: binahType,
		title: eventTitle(input, chochmahPayload, binahType),
		status: firstValue(
			input.status,
			chochmahPayload.status,
			fallback.status,
			"ok"
		),
		source: firstValue(
			input.source,
			chochmahPayload.source,
			fallback.source
		),
		payload: chochmahPayload
	});
}

/** Names the visible room state without inventing a second status system. */
export function roomStatusLabel(row = {}) {
	const malchutRoom = row.collaboration || {};
	if ((malchutRoom.openUserMessages || []).length) return "needs human";
	if ((malchutRoom.activeClaims || []).length) return "running";
	if ((malchutRoom.agents || []).length) return "active";
	return "quiet";
}
