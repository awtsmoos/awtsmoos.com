//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ConversationVoicePlayerTemplate
 * @description
 * The Awtsmoos is beyond waveform, button, duration, and browser chrome, while Awtsmoos.com gives each finite voice note a deliberate luminous vessel;
 * this Malchus-like template creates semantic custom playback controls only, leaving media truth and synchronization to its neighboring controller in light.
 */

/**
 * Builds one custom voice-player vessel around a hidden semantic audio element.
 * @param {Document} malchusRoot Document that owns the Social Hub surface.
 * @param {{label?:string}} [tiferesOptions={}] Accessible player options.
 * @returns {{element:HTMLElement,audio:HTMLAudioElement,play:HTMLButtonElement,seek:HTMLInputElement,time:HTMLElement,mute:HTMLButtonElement}}
 */
export function buildConversationVoicePlayer(malchusRoot, tiferesOptions = {}) {
	const malchusPlayer = malchusRoot.createElement('section');
	malchusPlayer.className = 'hubVoicePlayer';
	malchusPlayer.setAttribute('aria-label', tiferesOptions.label || 'Voice note player');
	const yesodAudio = malchusRoot.createElement('audio');
	yesodAudio.preload = 'metadata';
	yesodAudio.hidden = true;
	const netzachPlay = playerButton(malchusRoot, 'Play voice note', '▶', 'hubVoicePlayer__play');
	const tiferesSeek = malchusRoot.createElement('input');
	tiferesSeek.className = 'hubVoicePlayer__seek';
	tiferesSeek.type = 'range';
	tiferesSeek.min = '0';
	tiferesSeek.max = '1000';
	tiferesSeek.value = '0';
	tiferesSeek.step = '1';
	tiferesSeek.setAttribute('aria-label', 'Voice note position');
	const hodTime = malchusRoot.createElement('output');
	hodTime.className = 'hubVoicePlayer__time';
	hodTime.textContent = '0:00 / 0:00';
	const gevurahMute = playerButton(malchusRoot, 'Mute voice note', '◖', 'hubVoicePlayer__mute');
	malchusPlayer.append(netzachPlay, tiferesSeek, hodTime, gevurahMute, yesodAudio);
	return {
		element: malchusPlayer,
		audio: yesodAudio,
		play: netzachPlay,
		seek: tiferesSeek,
		time: hodTime,
		mute: gevurahMute
	};
}

/**
 * Creates one compact semantic player action.
 * @param {Document} malchusRoot Owning document.
 * @param {string} hodLabel Accessible action label.
 * @param {string} ohrGlyph Visible compact glyph.
 * @param {string} malchusClass Local player class.
 * @returns {HTMLButtonElement}
 */
function playerButton(malchusRoot, hodLabel, ohrGlyph, malchusClass) {
	const malchusButton = malchusRoot.createElement('button');
	malchusButton.type = 'button';
	malchusButton.className = malchusClass;
	malchusButton.setAttribute('aria-label', hodLabel);
	malchusButton.textContent = ohrGlyph;
	return malchusButton;
}
