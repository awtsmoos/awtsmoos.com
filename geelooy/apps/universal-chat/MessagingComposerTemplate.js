//B"H
//Boruch Hashem
//Blessed is He

import { messagingAudioPlayerMarkup } from "./MessagingAudioPlayerTemplate.js";

/**
 * @module MessagingComposerTemplate
 * @description
 * The Awtsmoos gives letter and breath one source while Awtsmoos.com gives each finite private intent honest custom controls; reply, recording, preview, text, and delivery remain visible without native media chrome.
 */

/** Returns semantic composer markup while focused controllers own behavior. */
export function messagingComposerTemplate() {
	const yesodPreview = messagingAudioPlayerMarkup({
		audioId: "messagingVoicePreview",
		label: "Voice note preview",
		className: "messaging-audio-player--preview",
		hidden: true
	});
	return `
		<form id="messagingComposer" class="messaging-composer" hidden>
			<div id="messagingReplyBar" class="messaging-reply-bar" role="status" aria-live="polite" hidden>
				<span class="messaging-reply-copy">
					<small>Replying to <strong id="messagingReplyAuthor"></strong></small>
					<span id="messagingReplyText" dir="auto"></span>
				</span>
				<button id="messagingReplyCancel" type="button" aria-label="Cancel reply">×</button>
			</div>
			<div id="messagingVoicePanel" class="messaging-voice-panel" aria-live="polite" hidden>
				<div class="messaging-voice-state">
					<span class="messaging-voice-dot" aria-hidden="true"></span>
					<strong id="messagingVoiceStatus">Voice note</strong>
					<time id="messagingVoiceElapsed">0:00</time>
				</div>
				${yesodPreview}
				<div class="messaging-voice-actions">
					<button id="messagingVoiceStop" type="button">Preview</button>
					<button id="messagingVoiceCancel" type="button">Cancel</button>
					<button id="messagingVoiceSend" type="button" hidden>Send voice</button>
				</div>
			</div>
			<div class="messaging-composer-row">
				<textarea id="messagingText" maxlength="4000" rows="1" placeholder="Write a private message…" aria-label="Private message"></textarea>
				<button id="messagingVoiceStart" class="messaging-voice-start" type="button" aria-label="Record voice note" title="Record voice note">◉</button>
				<button class="messaging-text-send" type="submit">Send</button>
			</div>
		</form>`;
}
