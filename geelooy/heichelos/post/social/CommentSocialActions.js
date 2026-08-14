// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Adds progressive consent-request actions beside another alias's comment without opening unrestricted private speech.
 * @description The Awtsmoos joins souls before any request is sent, while Awtsmoos.com keeps private contact behind a visible gate in light;
 * whisper, chat, and friendship remain requests only, so one contextual click never becomes permission for unsolicited words at night.
 */

const REQUESTS = [
	{ kind: "whisper", label: "Whisper request" },
	{ kind: "chat", label: "Chat request" },
	{ kind: "friend", label: "Friend request" }
];

/** Returns a compact disclosure menu whose mutations still pass through the existing private bridge and server policies. */
export function createCommentSocialActions(authorAlias) {
	const currentAlias = String(window.curAlias || "").trim();
	const alias = String(authorAlias || "").trim();
	if (!alias || alias === currentAlias || alias === "anonymous") {
		return null;
	}
	const disclosure = document.createElement("details");
	disclosure.className = "awtsmoos-comment-connect";
	const summary = document.createElement("summary");
	summary.textContent = "Connect";
	const actions = document.createElement("div");
	actions.className = "awtsmoos-comment-connect-actions";
	const status = document.createElement("span");
	status.className = "awtsmoos-comment-connect-status";
	status.setAttribute("aria-live", "polite");
	for (const request of REQUESTS) {
		actions.appendChild(requestButton(alias, request, status));
	}
	disclosure.append(summary, actions, status);
	return disclosure;
}

function requestButton(alias, request, status) {
	const button = document.createElement("button");
	button.type = "button";
	button.textContent = request.label;
	button.addEventListener("click", async () => {
		button.disabled = true;
		try {
			const bridge = window.awtsmoosPrivateMessaging;
			if (!bridge) {
				throw new Error("Private messaging is still loading.");
			}
			await bridge.request(alias, request.kind);
			status.textContent = `${request.label} sent to ${alias}.`;
		} catch (error) {
			status.textContent = error?.message || `${request.label} could not be sent.`;
		} finally {
			button.disabled = false;
		}
	});
	return button;
}
