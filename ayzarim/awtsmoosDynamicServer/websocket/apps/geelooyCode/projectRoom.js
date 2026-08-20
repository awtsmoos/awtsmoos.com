// B"H
// Boruch Hashem
// Blessed is He

const {
	accountDigest,
	guestPresentation,
	isVerified,
	tokenDigest
} = require("./identity.js");
const { boundedText } = require("./protocol.js");
const { normalizeProjectPath } = require("./pathPolicy.js");

/**
 * @file Holds private authorization shadows and public-safe presence for one code project.
 * @description The Awtsmoos knows each collaborator beyond cursor and account; Awtsmoos.com
 * keeps only hashed authority beside the presentation data needed to feel another coder nearby.
 */
class ProjectRoom {
	constructor(projectId) {
		this.projectId = projectId;
		this.participants = new Map();
	}

	join(client, identity, displayName, rights, token = "") {
		const guest = guestPresentation();
		const supplied = boundedText(displayName, "Display name", 48, "").trim();
		const participant = {
			client,
			presentationId: guest.presentationId,
			displayName: supplied || (
				isVerified(identity)
					? "Signed-in coder"
					: guest.displayName
			),
			mode: rights.canEdit ? "editing" : "viewing",
			path: "",
			selectionStart: 0,
			selectionEnd: 0,
			privateAccountDigest: isVerified(identity)
				? accountDigest(identity)
				: "",
			capabilityDigest: tokenDigest(token)
		};
		this.participants.set(client, participant);
		return participant;
	}

	leave(client) {
		return this.participants.delete(client);
	}

	participant(client) {
		return this.participants.get(client) || null;
	}

	updatePresence(client, payload, canEdit) {
		const participant = this.participant(client);
		if (!participant) throw new Error("Join the project before sending presence");
		participant.path = payload.path
			? normalizeProjectPath(payload.path)
			: "";
		participant.selectionStart = safePosition(payload.selectionStart);
		participant.selectionEnd = safePosition(payload.selectionEnd);
		participant.mode = canEdit && payload.mode === "editing"
			? "editing"
			: "viewing";
		return participant;
	}

	publicPresence() {
		return this.allParticipants().map(participant => ({
			presentationId: participant.presentationId,
			displayName: participant.displayName,
			mode: participant.mode,
			path: participant.path,
			selectionStart: participant.selectionStart,
			selectionEnd: participant.selectionEnd
		}));
	}

	allParticipants() {
		return Array.from(this.participants.values());
	}

	allClients() {
		return Array.from(this.participants.keys());
	}

	get size() {
		return this.participants.size;
	}
}

function safePosition(value) {
	const number = Number(value);
	return Number.isSafeInteger(number) && number >= 0
		? Math.min(number, 16 * 1024 * 1024)
		: 0;
}

module.exports = {
	ProjectRoom
};
