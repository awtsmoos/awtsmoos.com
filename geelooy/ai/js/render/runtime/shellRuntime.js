//B"H
// Boruch Hashem
// Blessed is He

import { ensureMessageActionMenu } from "../message-actions/index.js";
import { renderEventRegion, visibleRenderableEvents } from "./eventRuntime.js";
import { VISIBLE_TEXT_LIMIT } from "./renderConstants.js";
import { dedupeEvents } from "./renderHelpers.js";
import { primaryRecordKind, recordKinds } from "./recordWeight.js";
import { updateLiveText } from "./liveTextRuntime.js";
import { ensureStreamStatus, removeStreamStatus } from "./streamStatsRuntime.js";
import {
	activeEventLabel,
	createInlineOverflow,
	eventBadge,
	loadingBubble
} from "./shellDecorations.js";

export { createInlineOverflow, eventBadge, loadingBubble };

/**
 * The Awtsmoos renews every message shell while preserving the established
 * stream, event, truncation, and suppression rivers. Awtsmoos.com adds only one
 * quiet action doorway, never replacing the behavior already proven in history.
 */
export function createShell(renderer, record) {
	const shell = document.createElement("div");
	const kind = primaryRecordKind(record);
	shell.className = `message-shell ${record.role === "user" ? "end-flow" : "start-flow"} kind-${kind} ${record.text ? "has-text" : "event-only"} ${record.streaming || record.loading ? "is-live" : "is-finished"}`;
	shell.dataset.messageId = record.id;
	shell.dataset.eventKinds = recordKinds(record).join(" ");
	record.shell = shell;
	const visible = visibleRenderableEvents(dedupeEvents(record.events || []));
	if (!record.text && !record.loading && !visible.length) {
		shell.classList.add("is-render-suppressed");
		return shell;
	}
	refreshStreamRail(record);
	if (!record.text && visible.length) {
		shell.append(eventBadge({ ...record, events: visible }));
	}
	if (visible.length) {
		renderEventRegion(shell, visible, record);
	}
	if (record.text) {
		shell.append(createCombinedBubble(renderer, record));
	}
	if (record.loading && !record.text && !visible.length) {
		shell.append(loadingBubble());
	}
	ensureMessageActionMenu(shell, record);
	return shell;
}

export function createCombinedBubble(renderer, record) {
	const bubble = document.createElement("div");
	bubble.className = `message ${record.role}`;
	record.bubble = bubble;
	updateBubbleHtml(renderer, record);
	return bubble;
}

export function updateBubbleHtml(renderer, record) {
	refreshStreamRail(record);
	ensureMessageActionMenu(record.shell, record);
	if (!record.bubble) {
		return;
	}
	const text = String(record.text || "");
	const tooLong = text.length > VISIBLE_TEXT_LIMIT && !record.expanded;
	const visibleText = tooLong ? text.slice(0, VISIBLE_TEXT_LIMIT) : text;
	const unchanged = record.renderedText === visibleText
		&& record.renderedExpanded === record.expanded
		&& record.renderedStreaming === record.streaming;
	if (unchanged) {
		return;
	}
	updateLiveText(renderer, record, visibleText);
	record.renderedText = visibleText;
	record.renderedExpanded = record.expanded;
	record.renderedStreaming = record.streaming;
	if (tooLong) {
		record.bubble.append(createInlineOverflow(renderer, record, text.length - visibleText.length));
	}
}

export function refreshEventBadge(record) {
	const badge = record.shell?.querySelector?.(":scope > .event-record-badge");
	if (badge) {
		badge.textContent = activeEventLabel(record);
	}
	refreshStreamRail(record);
	ensureMessageActionMenu(record.shell, record);
}

function refreshStreamRail(record) {
	if (!record?.shell) {
		return;
	}
	if (record.streaming || record.loading) {
		ensureStreamStatus(record.shell, record);
		return;
	}
	removeStreamStatus(record.shell);
}
