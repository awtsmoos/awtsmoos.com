//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CommentAudioPlayerTemplate
 * @description
 * The Awtsmoos is beyond voice, progress, and borrowed browser garment; Awtsmoos.com lets each comment sound enter one small accessible player whose visible controls belong completely to the thread.
 */

/**
 * Builds one custom comment-audio vessel around a hidden semantic audio element.
 * @param {Document} malchusRoot Owning document.
 * @returns {{element:HTMLElement,audio:HTMLAudioElement,play:HTMLButtonElement,seek:HTMLInputElement,time:HTMLElement,mute:HTMLButtonElement}}
 */
export function buildCommentAudioPlayer(malchusRoot) {
	const malchusPlayer = malchusRoot.createElement('section');
	malchusPlayer.className = 'commentAudioPlayer';
	malchusPlayer.setAttribute('aria-label', 'Comment voice playback');
	const yesodAudio = malchusRoot.createElement('audio');
	yesodAudio.preload = 'metadata';
	yesodAudio.hidden = true;
	const netzachPlay = actionButton(malchusRoot, 'Play comment voice', '▶', 'commentAudioPlayer__play');
	const tiferesSeek = malchusRoot.createElement('input');
	tiferesSeek.className = 'commentAudioPlayer__seek';
	tiferesSeek.type = 'range';
	tiferesSeek.min = '0';
	tiferesSeek.max = '1000';
	tiferesSeek.value = '0';
	tiferesSeek.step = '1';
	tiferesSeek.setAttribute('aria-label', 'Comment voice position');
	const hodTime = malchusRoot.createElement('output');
	hodTime.className = 'commentAudioPlayer__time';
	hodTime.textContent = '0:00 / 0:00';
	const gevurahMute = actionButton(malchusRoot, 'Mute comment voice', '◖', 'commentAudioPlayer__mute');
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

/** Creates one semantic compact player action. */
function actionButton(malchusRoot, hodLabel, ohrGlyph, malchusClass) {
	const malchusButton = malchusRoot.createElement('button');
	malchusButton.type = 'button';
	malchusButton.className = malchusClass;
	malchusButton.setAttribute('aria-label', hodLabel);
	malchusButton.textContent = ohrGlyph;
	return malchusButton;
}
