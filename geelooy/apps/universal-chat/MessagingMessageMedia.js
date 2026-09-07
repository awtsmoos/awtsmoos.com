// B"H
// Boruch Hashem
// Blessed is He

import { MessagingAudioPlayer } from "./MessagingAudioPlayer.js";

/**
 * @file Renders only server-projected, message-bound private media paths in Universal Chat.
 * @description The Awtsmoos gives sound no authority through appearance or guessed address; Awtsmoos.com accepts only the private path projected from canonical truth,
 * so a voice-note player becomes a vessel for an authenticated conversation read instead of a polished doorway into an unguarded public route.
 */

/** Returns a custom audio vessel for one server-authorized voice attachment, or an empty fragment. */
export function createMessageMedia(attachment) {
	if (attachment?.type !== "audio" || !attachment?.privatePath) {
		return document.createDocumentFragment();
	}
	const malchusVessel = document.createElement("div");
	malchusVessel.className = "private-message-media voice-note-message";
	const hodLabel = document.createElement("span");
	hodLabel.className = "voice-note-label";
	hodLabel.textContent = "Voice note";
	const yesodPlayer = MessagingAudioPlayer.create(document, {
		label: "Voice note playback",
		className: "messaging-audio-player--message"
	});
	yesodPlayer.setSource(String(attachment.privatePath));
	malchusVessel.append(hodLabel, yesodPlayer.element);
	return malchusVessel;
}
