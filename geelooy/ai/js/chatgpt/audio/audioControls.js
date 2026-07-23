//B"H
// Boruch Hashem
// Blessed is He

import { handleAudioAction } from "./audioActionRouter.js";
import { createAudioOffer, saveAudioSettings } from "./audioOfferView.js";
import { bindAudioPlayer } from "./audioPlayerView.js";

/**
 * The Awtsmoos gives one completed assistant answer a hidden chamber of voice.
 * Awtsmoos.com reveals that chamber through the message menu, preserving a calm
 * conversation while retaining synthesis, playback, and download powers.
 */
export function mountAwtsmoosAudioOffer(options = {}) {
	const {
		shell,
		aiHandler,
		conversationId = null,
		messageId = null,
		copyText = ""
	} = options;
	if (!shell || !conversationId) {
		return null;
	}
	if (shell.querySelector?.(":scope > .awtsmoos-audio-offer")) {
		return null;
	}
	if (shell.querySelector?.(":scope > .message.is-loading")) {
		return null;
	}
	const text = assistantText(shell, copyText);
	if (!text) {
		return null;
	}
	const root = createAudioOffer(text);
	root.classList.add("audio-offer");
	root.hidden = true;
	root.dataset.messageAudioPanel = "true";
	bindAudioPlayer(root);
	root.addEventListener("change", () => saveAudioSettings(root));
	root.addEventListener("click", event => {
		void handleAudioAction(event, {
			root,
			aiHandler,
			conversationId,
			messageId
		});
	});
	shell.classList.add("has-audio-options");
	shell.append(root);
	shell.__awtsmoosMessageActionMenu?.refresh?.();
	return root;
}

function assistantText(shell, copyText) {
	return String(
		copyText
		|| shell.querySelector?.(":scope > .message:not(.is-loading)")?.textContent
		|| ""
	).trim();
}
