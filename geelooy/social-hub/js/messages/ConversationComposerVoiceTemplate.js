//B"H
//Boruch Hashem
//Blessed is He

import { ConversationVoicePlayer } from './ConversationVoicePlayer.js';

/**
 * @module ConversationComposerVoiceTemplate
 * @description
 * The Awtsmoos is beyond recorder, preview, action, and audible time, while Awtsmoos.com gives the private composer one bounded voice chamber;
 * this Hod-like builder owns only recording-preview DOM so microphone, blob, upload, and delivery truth remain in their dedicated vessels.
 */

/**
 * Builds the private-message recording region around the shared custom voice player.
 * @param {Document} malchusRoot Owning Social Hub document.
 * @param {object} tiferesHandlers Voice action callbacks.
 * @returns {{region:HTMLElement,status:HTMLElement,clock:HTMLElement,player:ConversationVoicePlayer,audio:HTMLAudioElement,stop:HTMLButtonElement,cancel:HTMLButtonElement,send:HTMLButtonElement}}
 */
export function buildConversationVoiceRegion(malchusRoot, tiferesHandlers = {}) {
	const malchusRegion = malchusRoot.createElement('section');
	malchusRegion.className = 'hubConversationVoiceComposer';
	malchusRegion.hidden = true;
	const hodStatus = malchusRoot.createElement('strong');
	hodStatus.textContent = 'Voice note';
	const netzachClock = malchusRoot.createElement('span');
	netzachClock.className = 'hubConversationVoiceClock';
	netzachClock.textContent = '0:00';
	const yesodPlayer = new ConversationVoicePlayer(malchusRoot, {
		label: 'Voice note preview'
	});
	yesodPlayer.element.classList.add('hubVoicePlayer--preview');
	yesodPlayer.setHidden(true);
	const gevurahStop = voiceAction(malchusRoot, 'Stop', tiferesHandlers.onStopVoice);
	const gevurahCancel = voiceAction(malchusRoot, 'Cancel', tiferesHandlers.onCancelVoice);
	const chesedSend = voiceAction(malchusRoot, 'Send voice', tiferesHandlers.onSendVoice);
	malchusRegion.append(
		hodStatus,
		netzachClock,
		yesodPlayer.element,
		gevurahStop,
		gevurahCancel,
		chesedSend
	);
	return {
		region: malchusRegion,
		status: hodStatus,
		clock: netzachClock,
		player: yesodPlayer,
		audio: yesodPlayer.audio,
		stop: gevurahStop,
		cancel: gevurahCancel,
		send: chesedSend
	};
}

/** Creates one semantic recording action with the provided callback. */
function voiceAction(malchusRoot, hodLabel, tiferesHandler) {
	const malchusButton = malchusRoot.createElement('button');
	malchusButton.type = 'button';
	malchusButton.textContent = hodLabel;
	malchusButton.addEventListener('click', event => tiferesHandler?.(event));
	return malchusButton;
}
