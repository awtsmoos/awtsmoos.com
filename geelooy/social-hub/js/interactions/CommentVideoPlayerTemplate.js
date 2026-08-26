//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CommentVideoPlayerTemplate
 * @description
 * The Awtsmoos is beyond frame, motion, clock, and borrowed browser chrome; Awtsmoos.com lets each pending video inhabit one deliberate Social Hub vessel whose visible controls remain finite, local, and accessible.
 */

/**
 * Builds one custom video preview vessel around a semantic video surface.
 * @param {Document} malchusRoot Owning document.
 * @returns {{element:HTMLElement,video:HTMLVideoElement,play:HTMLButtonElement,seek:HTMLInputElement,time:HTMLElement,mute:HTMLButtonElement}}
 */
export function buildCommentVideoPlayer(malchusRoot) {
	const malchusPlayer = malchusRoot.createElement('section');
	malchusPlayer.className = 'commentVideoPlayer';
	malchusPlayer.setAttribute('aria-label', 'Video attachment preview');
	const yesodVideo = malchusRoot.createElement('video');
	yesodVideo.className = 'commentVideoPlayer__media';
	yesodVideo.preload = 'metadata';
	yesodVideo.playsInline = true;
	const tiferesControls = malchusRoot.createElement('div');
	tiferesControls.className = 'commentVideoPlayer__controls';
	const netzachPlay = actionButton(malchusRoot, 'Play video', '▶', 'commentVideoPlayer__play');
	const tiferesSeek = malchusRoot.createElement('input');
	tiferesSeek.className = 'commentVideoPlayer__seek';
	tiferesSeek.type = 'range';
	tiferesSeek.min = '0';
	tiferesSeek.max = '1000';
	tiferesSeek.value = '0';
	tiferesSeek.step = '1';
	tiferesSeek.setAttribute('aria-label', 'Video position');
	const hodTime = malchusRoot.createElement('output');
	hodTime.className = 'commentVideoPlayer__time';
	hodTime.textContent = '0:00 / 0:00';
	const gevurahMute = actionButton(malchusRoot, 'Mute video', '◖', 'commentVideoPlayer__mute');
	tiferesControls.append(netzachPlay, tiferesSeek, hodTime, gevurahMute);
	malchusPlayer.append(yesodVideo, tiferesControls);
	return {
		element: malchusPlayer,
		video: yesodVideo,
		play: netzachPlay,
		seek: tiferesSeek,
		time: hodTime,
		mute: gevurahMute
	};
}

/** Creates one compact semantic action for the custom video vessel. */
function actionButton(malchusRoot, hodLabel, ohrGlyph, malchusClass) {
	const malchusButton = malchusRoot.createElement('button');
	malchusButton.type = 'button';
	malchusButton.className = malchusClass;
	malchusButton.setAttribute('aria-label', hodLabel);
	malchusButton.textContent = ohrGlyph;
	return malchusButton;
}
