//B"H
// Boruch Hashem
// Blessed is He

import { recordKinds } from "./recordWeight.js";
import { toolHeadline } from "../event-ui/toolHeadline.js";

/**
 * Around each message the Awtsmoos reveals small signs: a loading pulse, an
 * event badge, and an overflow door. Awtsmoos.com keeps those signs separate
 * while preserving the renderer's established public contracts.
 */
export function eventBadge(record) {
	const badge = document.createElement("div");
	badge.className = "event-record-badge";
	badge.textContent = activeEventLabel(record);
	return badge;
}

export function createInlineOverflow(renderer, record, hiddenCount) {
	const wrap = document.createElement("div");
	wrap.className = "inline-overflow-note";
	const show = document.createElement("button");
	show.className = "inline-overflow-button";
	show.textContent = `Show ${hiddenCount.toLocaleString()} more characters`;
	show.onclick = () => {
		record.expanded = true;
		renderer.refreshLive(record);
		renderer.scrollDown();
	};
	wrap.append(show);
	return wrap;
}

export function loadingBubble() {
	const bubble = document.createElement("div");
	bubble.className = "message assistant is-loading extreme-loading";
	bubble.innerHTML = '<div class="message-loading"><i></i><span></span><span></span><span></span><em>incoming sparks…</em></div>';
	return bubble;
}

export function activeEventLabel(record) {
	const events = record.events || [];
	const activeTool = [...events].reverse().find(event => /tool|awtsmoos/i.test(event.kind || ""));
	if (activeTool) {
		const info = toolHeadline(activeTool);
		const target = info.target && info.target !== info.action ? ` · ${info.target}` : "";
		const prefix = record.streaming || record.loading ? "Running" : "Tool trace";
		return `${prefix}: ${info.action}${target}`;
	}
	const kinds = recordKinds(record);
	if (kinds.includes("thinking")) {
		return record.streaming || record.loading ? "Thinking live…" : "Thinking trace";
	}
	if (kinds.includes("status")) {
		return record.streaming || record.loading ? "Status streaming…" : "Status trace";
	}
	return record.streaming || record.loading ? "Transport streaming…" : "Transport trace";
}
