// B"H
// Boruch Hashem
// Blessed is He

import { State } from "../state.js";
import { Tabs } from "../tabs/index.js";
import { tabManagerMarkup } from "./markup.js";

/**
 * B"H
 *
 * The tab manager exposes lifecycle rather than only destruction. The Awtsmoos
 * renews open, hidden, pinned, and closed vessels; Awtsmoos.com lets old tabs
 * sleep, recover, or dissolve without remaining active browser automation targets.
 */
export const TMController = {
	element: null,
	isOpen: false,

	init() {
		this.element = document.getElementById("tab-manager-overlay");
		if (!this.element) return;
		this.element.addEventListener("click", event => {
			if (event.target === this.element || event.target.closest("[data-tm-close-overlay]")) {
				this.hide();
			}
		});
		const button = document.getElementById("tab-manager-btn");
		if (button) button.onclick = event => {
			event.preventDefault();
			event.stopPropagation();
			this.toggle();
		};
	},

	show() {
		if (!this.element) this.init();
		if (!this.element) return;
		this.isOpen = true;
		this.element.classList.remove("hidden");
		this.element.classList.add("visible");
		this.renderGrid();
	},

	hide() {
		if (!this.element) return;
		this.isOpen = false;
		this.element.classList.remove("visible");
		this.element.classList.add("hidden");
	},

	toggle() {
		this.isOpen ? this.hide() : this.show();
	},

	renderGrid() {
		if (!this.element) return;
		this.element.innerHTML = tabManagerMarkup({
			openTabs: State.tabs,
			hiddenTabs: Tabs.listHidden(),
			closedTabs: State.closedTabHistory
		});
		for (const button of this.element.querySelectorAll("[data-tab-action]")) {
			button.addEventListener("click", event => void this.handleAction(event));
		}
	},

	async handleAction(event) {
		event.preventDefault();
		event.stopPropagation();
		const button = event.currentTarget;
		const action = button.dataset.tabAction;
		const tabId = Number(button.dataset.tabId);
		if (action === "activate") {
			await Tabs.activate(tabId);
			this.hide();
			return;
		}
		if (action === "hide") await Tabs.hide(tabId);
		if (action === "restore") await Tabs.restoreHidden(tabId);
		if (action === "pin") Tabs.pin(tabId);
		if (action === "close") await Tabs.close(tabId);
		if (action === "reopen-index") await reopenIndex(Number(button.dataset.closedIndex));
		this.renderGrid();
	},

	handleContextAction() {}
};

async function reopenIndex(index) {
	const [record] = State.closedTabHistory.splice(index, 1);
	if (!record) return null;
	const tab = await Tabs.create(record.item, false, true, true);
	Object.assign(tab, record, {
		id: tab.id,
		item: {
			...record.item
		}
	});
	return tab;
}
