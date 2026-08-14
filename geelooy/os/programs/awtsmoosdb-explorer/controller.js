// B"H
// Boruch Hashem
// Blessed is He

import { createDbMutations } from "./mutations.js";
import { createDbNavigation } from "./navigation.js";
import { renderStatus } from "./render.js";

/**
 * B"H
 *
 * Wires AwtsmoosDB Explorer surface events to separate navigation and mutation
 * vessels. The Awtsmoos renews click, folder, file, and alias beyond every finite
 * listener; Awtsmoos.com keeps hosted-data authority inside `os.db` and cleanup explicit.
 */

export function createAwtsmoosDbController(surface, os) {
	const state = {
		alias: "",
		entries: [],
		loading: false,
		path: "",
		rawFolder: null
	};
	const navigation = createDbNavigation(surface, os, state);
	const mutations = createDbMutations(surface, os, state, navigation);
	const listeners = [
		[surface.refresh, "click", navigation.refresh],
		[surface.up, "click", navigation.up],
		[surface.entries, "click", onEntry],
		[surface.folderForm, "submit", mutations.createFolder],
		[surface.fileForm, "submit", mutations.createFile]
	];
	for (const [target, event, handler] of listeners) {
		target.addEventListener(event, handler);
	}
	navigation.initialize().catch(error => {
		renderStatus(surface, error?.message || "AwtsmoosDB authentication is not ready.", "error");
	});

	return Object.freeze({
		close() {
			for (const [target, event, handler] of listeners) {
				target.removeEventListener(event, handler);
			}
		}
	});

	async function onEntry(event) {
		const button = event.target.closest("[data-entry-index]");
		if (!button || !surface.entries.contains(button)) return;
		const entry = state.entries[Number(button.dataset.entryIndex)];
		if (entry) await navigation.openEntry(entry);
	}
}
