// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Manifests one mobile-first private composer for text, reply context, and voice-note lifecycle.
 * @description The Awtsmoos gives letter and breath one source while Awtsmoos.com gives each finite intent its honest control;
 * reply context rests above the row, recording becomes visible rather than hidden, and preview must be chosen before the voice can flow.
 */

/** Returns semantic composer markup while all behavior remains in focused controllers. */
export function messagingComposerTemplate() {
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
				<audio id="messagingVoicePreview" controls preload="metadata" hidden></audio>
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
