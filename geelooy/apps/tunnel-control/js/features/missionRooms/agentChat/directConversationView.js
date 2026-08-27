//B"H
//Boruch Hashem
//Blessed is He

import { agentConversation } from "./model.js";
import { node } from "./dom.js";

/**
 * B"H
 * The Awtsmoos lets each message retain actor, target, time, body, and delivery
 * state without collapsing into an unreadable sentence. Awtsmoos.com gives the
 * live conversation a clear visual rhythm while preserving exact event truth.
 */

/** Builds the recent direct conversation for one selected agent. */
export function createConversationLog(state, selectedAgentId) {
	const log = node("div", "awt-agent-direct-log");
	log.setAttribute("aria-live", "polite");
	log.setAttribute("aria-label", `Conversation with ${selectedAgentId}`);
	for (const event of agentConversation(state, selectedAgentId).slice(-8)) {
		log.append(createMessageRow(event, selectedAgentId));
	}
	if (!log.children.length) {
		log.append(createEmptyConversation());
	}
	return log;
}

function createMessageRow(event, selectedAgentId) {
	const actor = event.actor || event.payload?.fromAgent || "room";
	const target = event.target || event.payload?.toAgent || "room";
	const body = event.payload?.body || event.title || event.type || "event";
	const direction = actor === selectedAgentId ? "incoming" : "outgoing";
	const row = node(
		"article",
		`awt-agent-direct-message is-${event.status || "observed"} is-${direction}`
	);
	const meta = node("header", "awt-agent-message-meta");
	meta.append(
		node("strong", "", actor),
		node("span", "", `→ ${target}`),
		node("time", "", readableTime(event.at))
	);
	row.append(
		meta,
		node("p", "awt-agent-message-body", String(body)),
		node(
			"span",
			"awt-agent-message-state",
			readableState(event.status)
		)
	);
	row.title = event.at || "";
	return row;
}

function createEmptyConversation() {
	const empty = node("div", "awt-agent-empty awt-agent-conversation-empty");
	empty.append(
		node("span", "awt-agent-empty-orbit", "✦"),
		node("strong", "", "Direct channel is clear"),
		node("small", "", "Send the first instruction into this agent stream.")
	);
	return empty;
}

function readableTime(value) {
	const parsed = Date.parse(value || "");
	if (!parsed) return "live";
	return new Date(parsed).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit"
	});
}

function readableState(value) {
	return String(value || "observed").replaceAll(/[._:-]+/g, " ");
}
