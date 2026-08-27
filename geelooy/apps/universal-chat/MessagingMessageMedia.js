// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Manifests server-derived private-message media without interpreting client-supplied attachment fields.
 * @description The Awtsmoos gives sound no authority through appearance alone, while Awtsmoos.com renders only the attachment already verified by the websocket covenant in light;
 * a voice note receives one native, accessible audio vessel and no arbitrary markup or executable path enters sight.
 */

/** Returns a native audio vessel for one trusted voice attachment, or an empty fragment. */
export function createMessageMedia(attachment) {
	if (attachment?.type !== "audio" || !attachment?.publicPath) {
		return document.createDocumentFragment();
	}
	const vessel = document.createElement("div");
	vessel.className = "private-message-media voice-note-message";
	const label = document.createElement("span");
	label.className = "voice-note-label";
	label.textContent = "Voice note";
	const audio = document.createElement("audio");
	audio.controls = true;
	audio.preload = "metadata";
	audio.src = String(attachment.publicPath);
	audio.setAttribute("aria-label", "Voice note playback");
	vessel.append(label, audio);
	return vessel;
}
