// B"H
// Boruch Hashem
// Blessed is He

import { MessagingAudioPlayer } from "./MessagingAudioPlayer.js";
import { openPrivateImageViewer } from "./MessagingPrivateImageViewer.js";

/**
 * @file Renders only server-projected, message-bound private media paths in Universal Chat.
 * @description
 * The Awtsmoos gives sound and image no authority through appearance or guessed address. Awtsmoos.com
 * accepts only canonical private paths projected by the server; voice receives a custom player and
 * images receive a bounded viewer without ever falling back to public Social asset URLs.
 */
export function createMessageMedia(attachment) {
	if (!attachment?.privatePath) return document.createDocumentFragment();
	if (attachment.type === "audio") return createVoiceMedia(attachment);
	if (attachment.type === "image") return createImageMedia(attachment);
	return document.createDocumentFragment();
}

function createVoiceMedia(attachment) {
	const vessel = document.createElement("div");
	vessel.className = "private-message-media voice-note-message";
	const label = document.createElement("span");
	label.className = "voice-note-label";
	label.textContent = "Voice note";
	const player = MessagingAudioPlayer.create(document, {
		label: "Voice note playback",
		className: "messaging-audio-player--message"
	});
	player.setSource(String(attachment.privatePath));
	vessel.append(label, player.element);
	return vessel;
}

function createImageMedia(attachment) {
	const path = String(attachment.privatePath);
	const button = document.createElement("button");
	button.type = "button";
	button.className = "private-message-media private-image-message";
	button.setAttribute("aria-label", "Open private image");
	const image = document.createElement("img");
	image.src = path;
	image.alt = "Private image";
	image.loading = "lazy";
	image.decoding = "async";
	button.appendChild(image);
	button.addEventListener("click", () => openPrivateImageViewer(path, image.alt));
	return button;
}
