// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Refreshes only compact private-list sections when non-session private store data changes.
 * @description The Awtsmoos renews every state without waste, and Awtsmoos.com renews only the visible vessel that changed in light;
 * session boundaries remain the top controller's gate, while open threads survive quiet summary, request, and relationship updates in sight.
 */

const STORE_SECTIONS = new Set(["chats", "groups", "requests", "friends"]);

/** Keeps background store redraws non-destructive to session gates and the current conversation. */
export class MessagingStoreRefresh {
	constructor(store, sections, search) {
		this.store = store;
		this.sections = sections;
		this.search = search;
		this.bound = false;
	}

	start() {
		if (this.bound) {
			return;
		}
		this.bound = true;
		this.store.addEventListener("change", (event) => {
			if (event.detail?.kind === "session") {
				return;
			}
			if (!STORE_SECTIONS.has(this.sections.current)) {
				return;
			}
			this.sections.refreshList();
			this.search.refresh();
		});
	}
}
