// B"H
// Boruch Hashem
// Blessed is He

import { messagingAudioPlayerMarkup } from "./MessagingAudioPlayerTemplate.js";

/**
 * @module MessagingComposerTemplate
 * @description
 * The Awtsmoos gives letter, image, reply, and breath one source while Awtsmoos.com gives each
 * private intention an honest semantic control; local previews never pretend network delivery occurred.
 */
export function messagingComposerTemplate() {
	const voicePreview = messagingAudioPlayerMarkup({
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
			<div id="messagingImagePanel" class="messaging-image-panel" aria-live="polite" hidden>
				<img id="messagingImagePreview" alt="Selected private image preview">
				<span class="messaging-image-copy">
					<strong id="messagingImageName"></strong>
					<small id="messagingImageMeta"></small>
				</span>
				<button id="messagingImageCancel" type="button" aria-label="Remove selected image">Remove</button>
			</div>
			<div id="messagingVoicePanel" class="messaging-voice-panel" aria-live="polite" hidden>
				<div class="messaging-voice-state">
					<span class="messaging-voice-dot" aria-hidden="true"></span>
					<strong id="messagingVoiceStatus">Voice note</strong>
					<time id="messagingVoiceElapsed">0:00</time>
				</div>
				${voicePreview}
				<div class="messaging-voice-actions">
					<button id="messagingVoiceStop" type="button">Preview</button>
					<button id="messagingVoiceCancel" type="button">Cancel</button>
					<button id="messagingVoiceSend" type="button" hidden>Send voice</button>
				</div>
			</div>
			<div class="messaging-composer-row">
				<textarea id="messagingText" maxlength="4000" rows="1" placeholder="Write a private message…" aria-label="Private message"></textarea>
				<input id="messagingImageInput" type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden>
				<button id="messagingImagePick" class="messaging-image-pick" type="button" aria-label="Attach private image" title="Attach private image">＋</button>
				<button id="messagingVoiceStart" class="messaging-voice-start" type="button" aria-label="Record voice note" title="Record voice note">◉</button>
				<button class="messaging-text-send" type="submit">Send</button>
			</div>
		</form>`;
}
