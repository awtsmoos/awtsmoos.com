// B"H
// Boruch Hashem
// Blessed is He

import { createSubAgentElement as h } from "./dom.js";

/**
 * @file Renders self-contained browser-delivery proof for one visible sub-agent.
 * @description
 * The Awtsmoos lets the operator distinguish waiting, composer readiness, physical
 * Send activation, accepted POST, and verified target closure without opening logs.
 * Every badge reflects durable backend testimony; missing evidence remains visibly pending.
 */
export function createSubAgentDeliveryEvidence(agent = {}) {
	const delivery = agent.delivery || {};
	const proofBadges = [
		proofBadge("Prompt", delivery.promptVerified),
		postBadge(delivery),
		proofBadge("Tab closed", delivery.tabCloseVerified)
	];
	const children = [
		h("span", {
			className: `awt-subagents__agent-stage ${delivery.proofComplete ? "is-proven" : ""}`,
			text: delivery.stage || "Waiting for browser evidence"
		}),
		h("span", {
			className: "awt-subagents__agent-proofs",
			children: proofBadges
		})
	];
	if (agent.lastUpdate) {
		children.push(h("span", {
			className: "awt-subagents__agent-update",
			text: agent.lastUpdate
		}));
	}
	return h("span", { className: "awt-subagents__agent-evidence" }, ...children);
}

function proofBadge(label, proven) {
	return h("span", {
		className: `awt-subagents__proof ${proven ? "is-proven" : "is-pending"}`,
		text: `${label} ${proven ? "✓" : "…"}`
	});
}

function postBadge(delivery) {
	const accepted = delivery.accepted === true;
	const status = delivery.responseStatus ? ` ${delivery.responseStatus}` : "";
	return h("span", {
		className: `awt-subagents__proof ${accepted ? "is-proven" : "is-pending"}`,
		text: `POST${status} ${accepted ? "✓" : "…"}`
	});
}
