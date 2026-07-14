// B"H
// Boruch Hashem
// Blessed is He

import { normalizePreviewAction } from "./actions.js";

/**
 * B"H
 *
 * Preview control tracks living iframe targets explicitly. The Awtsmoos renews
 * target and message; Awtsmoos.com chooses the active visible preview and returns
 * bounded readiness failures instead of forcing agents to guess stale tab IDs.
 */
const targets = new Map();
let activeId = null;
let nextRequestId = 1;

export const PreviewControlRegistry = {
	register(tabId, iframe) {
		const id = String(tabId);
		targets.set(id, iframe);
		activeId = id;
		return iframe;
	},

	unregister(tabId) {
		const id = String(tabId);
		const removed = targets.delete(id);
		if (activeId === id) activeId = [...targets.keys()].at(-1) || null;
		return removed;
	},

	activate(tabId) {
		const id = String(tabId);
		if (!this.get(id)) return false;
		activeId = id;
		return true;
	},

	activeTabId() {
		return activeId && this.get(activeId) ? activeId : null;
	},

	get(tabId) {
		const id = String(tabId || "");
		let iframe = targets.get(id) || null;
		if (!iframe?.isConnected) {
			iframe = globalThis.document?.querySelector?.(`iframe[data-tab-id="${cssEscape(id)}"]`) || null;
			if (iframe) targets.set(id, iframe);
		}
		return iframe;
	},

	snapshot() {
		return [...targets.entries()]
			.filter(([, iframe]) => iframe?.isConnected)
			.map(([tabId, iframe]) => ({
				tabId,
				active: tabId === activeId,
				ready: Boolean(iframe.contentWindow)
			}));
	},

	async send(tabId, action, payload = {}, options = {}) {
		const id = String(tabId || this.activeTabId() || "");
		const iframe = this.get(id);
		if (!iframe?.contentWindow) {
			return {
				ok: false,
				status: 404,
				error: "preview_iframe_not_ready",
				tabId: id,
				availableTargets: this.snapshot()
			};
		}
		activeId = id;
		return requestIframe(iframe, id, normalizePreviewAction(action), payload, options.timeoutMs);
	}
};

function requestIframe(iframe, tabId, action, payload, timeoutMs = 6000) {
	const requestId = `preview-${Date.now()}-${nextRequestId++}`;
	return new Promise(resolve => {
		const timer = setTimeout(() => finish({
			ok: false,
			status: 504,
			error: "preview_control_timeout",
			action,
			tabId
		}), Math.max(100, Number(timeoutMs || 6000)));
		function onMessage(event) {
			const data = event.data || {};
			if (event.source !== iframe.contentWindow || data.requestId !== requestId) return;
			finish(data.result || data);
		}
		function finish(result) {
			clearTimeout(timer);
			globalThis.removeEventListener?.("message", onMessage);
			resolve({
				ok: result.ok !== false,
				action,
				tabId,
				...result
			});
		}
		globalThis.addEventListener?.("message", onMessage);
		iframe.contentWindow.postMessage({
			type: "awtsmoos-preview-control",
			requestId,
			action,
			payload
		}, "*");
	});
}

function cssEscape(value) {
	return globalThis.CSS?.escape ? CSS.escape(value) : String(value).replace(/["\\]/g, "\\$&");
}
