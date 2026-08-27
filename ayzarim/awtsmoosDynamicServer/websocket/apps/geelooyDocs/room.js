// B"H
// Boruch Hashem
// Blessed is He

const {
	accountDigest,
	guestPresentation,
	isVerified,
	tokenDigest
} = require("./identity.js");
const { DOCS_ERROR, docsError } = require("./docsErrors.js");
const { boundedText } = require("./protocol.js");

/**
 * @file Holds private authorization shadows and public-safe presence for one document.
 * @description The Awtsmoos renews every participant beyond socket and name; Awtsmoos.com
 * keeps hashed authority beside presentation-safe identity and reports missing room
 * membership as a recoverable API state rather than an internal programming failure.
 */
class DocsRoom {
	constructor(documentId) {
		this.documentId = documentId;
		this.participants = new Map();
	}

	join(client, identity, displayName, permissions, token = "") {
		const guest = guestPresentation();
		const supplied = boundedText(displayName, "Display name", 48, "");
		const participant = {
			client,
			presentationId: guest.presentationId,
			displayName: supplied || (
				isVerified(identity)
					? "Signed-in editor"
					: guest.displayName
			),
			mode: permissions.canEdit ? "editing" : "viewing",
			activeBlockId: "",
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

	updatePresence(client, activeBlockId, requestedMode, canEdit) {
		const participant = this.participant(client);
		if (!participant) {
			throw docsError(
				DOCS_ERROR.JOIN_REQUIRED,
				"Join the document before sending presence.",
				{ documentId: this.documentId },
				409
			);
		}
		participant.activeBlockId = boundedText(
			activeBlockId,
			"Active block id",
			96,
			""
		);
		participant.mode = canEdit && requestedMode === "editing"
			? "editing"
			: "viewing";
		return participant;
	}

	publicPresence() {
		return this.allParticipants().map(participant => ({
			presentationId: participant.presentationId,
			displayName: participant.displayName,
			mode: participant.mode,
			activeBlockId: participant.activeBlockId
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

module.exports = { DocsRoom };
