//B"H
//Boruch Hashem
//Blessed is He

import { node } from "./dom.js";

/**
 * B"H
 * The Awtsmoos gives the human word a deliberate launch chamber rather than a
 * bare text box. Awtsmoos.com preserves drafts, keyboard speed, delivery focus,
 * and honest busy state inside one accessible composer vessel.
 */

/** Builds the direct-message composer for one selected agent. */
export function createDirectComposer(state, selected, actions) {
	const composer = node("div", "awt-agent-composer");
	const input = createMessageInput(state, selected, actions);
	const footer = node("div", "awt-agent-composer-footer");
	footer.append(
		createComposerHint(),
		createSendButton(state, selected, input, actions)
	);
	composer.append(
		node("label", "awt-agent-composer-label", `Message ${selected.name}`),
		input,
		footer
	);
	return composer;
}

function createMessageInput(state, selected, actions) {
	const input = node("textarea", "awt-agent-direct-input");
	input.id = "roomAgentDirectMessage";
	input.placeholder = `Send a precise instruction to ${selected.name}…`;
	input.value = state.agentChatDrafts?.[selected.agentId] || "";
	input.disabled = state.agentChatBusy === true;
	input.rows = 4;
	input.addEventListener("input", () => actions.draft?.(input.value));
	input.addEventListener("keydown", event => {
		if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
			event.preventDefault();
			actions.send?.(input.value);
		}
	});
	return input;
}

function createComposerHint() {
	const platform = String(globalThis.navigator?.platform || "");
	const hint = node("span", "awt-agent-composer-hint");
	hint.append(
		node("kbd", "", platform.includes("Mac") ? "⌘" : "Ctrl"),
		node("span", "", "+"),
		node("kbd", "", "Enter"),
		node("span", "", "to send")
	);
	return hint;
}

function createSendButton(state, selected, input, actions) {
	const label = state.agentChatBusy ? "Transmitting…" : `Send to ${selected.name}`;
	const send = node("button", "primary awt-agent-send", label);
	send.type = "button";
	send.disabled = state.agentChatBusy === true;
	send.addEventListener("click", () => actions.send?.(input.value));
	return send;
}
