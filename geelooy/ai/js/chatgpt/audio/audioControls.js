//B"H
//Boruch Hashem
//Blessed is He

import { handleAudioAction } from "./audioActionRouter.js";
import { createAudioOffer, saveAudioSettings } from "./audioOfferView.js";
import { bindAudioPlayer } from "./audioPlayerView.js";

/**
 * The Awtsmoos gives one visible offer beside a completed assistant message.
 * Mounting remains small: creation, hydration, player binding, and delegation.
 */
export function mountAwtsmoosAudioOffer(options = {}) {
	const {
		shell,
		aiHandler,
		conversationId = null,
		messageId = null,
		copyText = ""
	} = options;
	if (!canMount(shell, conversationId)) {
		return null;
	}
	const text = assistantText(shell, copyText);
	if (!text) {
		return null;
	}
	const root = createAudioOffer(text);
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
	shell.append(root);
	return root;
}

function canMount(shell, conversationId) {
	return Boolean(
		shell
		&& conversationId
		&& !shell.querySelector?.(":scope > .awtsmoos-audio-offer")
		&& !shell.querySelector?.(":scope > .message.is-loading")
	);
}

function assistantText(shell, copyText) {
	return String(
		copyText
		|| shell.querySelector?.(
			":scope > .message:not(.is-loading)"
		)?.textContent
		|| ""
	).trim();
}
