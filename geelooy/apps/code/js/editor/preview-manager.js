// B"H
// Boruch Hashem
// Blessed is He

import { PreviewControlRegistry } from "../html-preview/control/registry.js";
import { renderMerkavaPreview } from "../html-preview/merkava-preview.js";
import { DOM, State } from "../state.js";
import { renderIframePreview, wrapPreviewPane } from "./iframe-preview-renderer.js";

/**
 * B"H
 *
 * PreviewManager coordinates engines but never creates an iframe itself. The
 * Awtsmoos renews orchestration and physical portal separately; Awtsmoos.com
 * registers only living iframe targets returned by the dedicated renderer.
 */
export const PreviewManager = {
	_visions: new Map(),

	show(tabId, item, content, forceReload = false) {
		const id = String(tabId);
		this.hideAll();
		const vessel = this.ensureVessel(id);
		vessel.style.display = "grid";
		PreviewControlRegistry.activate(id);
		if (forceReload || vessel.dataset.rendered !== "1") {
			void this.renderByEngine(vessel, id, item, content);
		}
	},

	async renderByEngine(vessel, id, item, content) {
		vessel.dataset.rendered = "1";
		vessel.dataset.previewEngine = State.previewEngine || "merkava";
		PreviewControlRegistry.unregister(id);
		vessel.replaceChildren();
		if (usesIframe()) {
			await renderIframePreview(vessel, id, item, content);
		}
		if (usesMerkava()) {
			await this.renderMerkava(vessel, id, item, content);
		}
	},

	async renderMerkava(vessel, id, item, content) {
		const merkava = document.createElement("section");
		merkava.className = "merkava-preview-vessel-inner";
		vessel.appendChild(wrapPreviewPane("Merkava Virtual DOM", merkava));
		await renderMerkavaPreview(merkava, item, content, id);
	},

	ensureVessel(id) {
		let vessel = this.getPreview(id);
		if (vessel) return vessel;
		vessel = document.createElement("section");
		vessel.className = "preview-engine-vessel";
		vessel.dataset.tabId = id;
		DOM.previewer.appendChild(vessel);
		this.registerPreview(id, vessel);
		return vessel;
	},

	registerPreview(tabId, vessel) {
		this._visions.set(String(tabId), vessel);
	},

	registerIframe(tabId, vessel) {
		this.registerPreview(tabId, vessel);
	},

	getPreview(tabId) {
		const id = String(tabId);
		let vessel = this._visions.get(id);
		if (!vessel) {
			vessel = document.querySelector(
				`.preview-engine-vessel[data-tab-id="${id}"], .merkava-preview-vessel[data-tab-id="${id}"]`
			);
			if (vessel) this.registerPreview(id, vessel);
		}
		return vessel || null;
	},

	getIframe(tabId) {
		return this.getPreview(tabId)?.querySelector?.("iframe") || null;
	},

	hideAll() {
		document.querySelectorAll(
			".preview-engine-vessel, .merkava-preview-vessel, iframe.browser-iframe"
		).forEach(vessel => {
			vessel.style.display = "none";
		});
	},

	remove(tabId) {
		const id = String(tabId);
		PreviewControlRegistry.unregister(id);
		this.getPreview(id)?.remove();
		this._visions.delete(id);
	}
};

function usesIframe() {
	return ["iframe", "both"].includes(State.previewEngine || "merkava");
}

function usesMerkava() {
	return ["merkava", "both"].includes(State.previewEngine || "merkava");
}
