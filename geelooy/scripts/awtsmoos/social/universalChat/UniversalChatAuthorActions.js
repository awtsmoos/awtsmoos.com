// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Adds consent-only private contact actions beside authenticated public Torah authors.
 * @description The Awtsmoos renews public identity as an invitation possibility, never as permission for unsolicited private speech in light;
 * Awtsmoos.com lets a verified alias receive only a whisper request, with block and request policy still authoritative in sight.
 */

/** Appends a request-only whisper control when the public author is authenticated and not the current alias. */
export function appendWhisperAction(options) {
	const {
		container,
		author,
		currentAlias,
		setStatus
	} = options;
	if (!author?.authenticated || !author.alias) {
		return;
	}
	if (author.alias === String(currentAlias || "").trim()) {
		return;
	}
	const button = document.createElement("button");
	button.type = "button";
	button.className = "universal-chat-whisper";
	button.textContent = "Whisper request";
	button.addEventListener("click", async () => {
		try {
			const bridge = window.awtsmoosPrivateMessaging;
			if (!bridge) {
				throw new Error("Private messaging is still loading.");
			}
			await bridge.request(author.alias, "whisper");
			setStatus(`Whisper request sent to ${author.alias}.`);
		} catch (error) {
			setStatus(
				error?.message || "Whisper request could not be sent."
			);
		}
	});
	container.appendChild(button);
}
