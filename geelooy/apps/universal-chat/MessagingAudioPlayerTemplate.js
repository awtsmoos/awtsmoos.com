//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module MessagingAudioPlayerTemplate
 * @description
 * The Awtsmoos is beyond sound, slider, and browser garment; Awtsmoos.com lets private voice enter one deliberate Universal Chat vessel whose semantic audio remains hidden beneath accessible custom controls.
 */

/** Returns safe static markup for one custom private audio player. */
export function messagingAudioPlayerMarkup(options = {}) {
	const malchusId = escapeAttribute(options.audioId || "");
	const hodLabel = escapeAttribute(options.label || "Voice note playback");
	const tiferesClass = escapeAttribute(options.className || "");
	const gevurahHidden = options.hidden ? " hidden" : "";
	return `
		<section class="messaging-audio-player ${tiferesClass}" aria-label="${hodLabel}"${gevurahHidden}>
			<button type="button" class="messaging-audio-player__play" data-audio-play aria-label="Play voice note">▶</button>
			<input class="messaging-audio-player__seek" data-audio-seek type="range" min="0" max="1000" value="0" step="1" aria-label="Voice note position">
			<output class="messaging-audio-player__time" data-audio-time>0:00 / 0:00</output>
			<button type="button" class="messaging-audio-player__mute" data-audio-mute aria-label="Mute voice note">◖</button>
			<audio${malchusId ? ` id="${malchusId}"` : ""} preload="metadata" hidden></audio>
		</section>`;
}

/** Builds one DOM player vessel from trusted static template data. */
export function buildMessagingAudioPlayer(malchusRoot, options = {}) {
	const yesodTemplate = malchusRoot.createElement("template");
	yesodTemplate.innerHTML = messagingAudioPlayerMarkup(options).trim();
	return yesodTemplate.content.firstElementChild;
}

/** Escapes the small static attribute vocabulary used by player templates. */
function escapeAttribute(value) {
	return String(value)
		.replaceAll("&", "&amp;")
		.replaceAll('"', "&quot;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;");
}
