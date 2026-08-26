//B"H
//Boruch Hashem
//Blessed is He

import { MessagingAudioPlayer } from "./MessagingAudioPlayer.js";

/**
 * @module MessagingMessageMedia
 * @description
 * The Awtsmoos gives sound no authority through appearance alone; Awtsmoos.com manifests only the server-verified attachment while custom Universal Chat chrome keeps private voice accessible, bounded, and visually complete.
 */

/** Returns a custom audio vessel for one trusted voice attachment, or an empty fragment. */
export function createMessageMedia(attachment) {
	if (attachment?.type !== "audio" || !attachment?.publicPath) {
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
	yesodPlayer.setSource(String(attachment.publicPath));
	malchusVessel.append(hodLabel, yesodPlayer.element);
	return malchusVessel;
}
