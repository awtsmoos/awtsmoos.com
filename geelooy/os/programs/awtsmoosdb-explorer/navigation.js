// B"H
// Boruch Hashem
// Blessed is He

import {
	currentAlias,
	readDbFile,
	readDbFolder
} from "./api.js";
import { normalizeFolderPayload } from "./model.js";
import { parentDbPath } from "./path.js";
import {
	renderFolder,
	renderInspector,
	renderStatus,
	renderUnavailableFolder
} from "./render.js";

/**
 * B"H
 *
 * Owns read-only AwtsmoosDB navigation over the exact alias-bound `os.db` client.
 * The Awtsmoos renews alias, folder, file, and selected record beyond each request;
 * Awtsmoos.com keeps signed-out state useful, explicit, and mutation-disabled.
 */

export function createDbNavigation(surface, os, state) {
	return Object.freeze({ enter, initialize, openEntry, refresh, up });

	async function initialize() {
		try {
			const alias = currentAlias(os);
			if (!alias) throw new Error("awtsmoos_alias_not_ready");
			state.alias = alias;
			surface.alias.textContent = `Alias: @${state.alias}`;
			setMutationsEnabled(surface, true);
			await refresh();
		} catch {
			state.alias = "";
			surface.alias.textContent = "Alias: sign in required";
			setMutationsEnabled(surface, false);
			renderUnavailableFolder(surface, state.path);
			renderStatus(
				surface,
				"Hosted records require an authenticated Awtsmoos alias. Sign in, then refresh this Explorer.",
				"error"
			);
		}
	}

	async function refresh() {
		if (state.loading || !state.alias) return;
		state.loading = true;
		renderStatus(surface, `Reading ${state.path || "alias root"}…`);
		try {
			state.rawFolder = await readDbFolder(os, state.path);
			state.entries = normalizeFolderPayload(state.rawFolder, state.path);
			renderFolder(surface, state.entries, state.path, state.alias);
			renderInspector(surface, null);
			renderStatus(surface, `${state.entries.length} hosted record${state.entries.length === 1 ? "" : "s"}.`);
		} catch (error) {
			renderStatus(surface, message(error), "error");
		} finally {
			state.loading = false;
		}
	}

	async function enter(path) {
		state.path = path;
		await refresh();
	}

	async function up() {
		state.path = parentDbPath(state.path);
		await refresh();
	}

	async function openEntry(entry) {
		renderInspector(surface, entry);
		if (entry.kind === "folder") return enter(entry.path);
		try {
			const value = await readDbFile(os, entry.path);
			renderInspector(surface, entry, value);
			renderStatus(surface, `Read ${entry.path}.`);
		} catch (error) {
			renderStatus(surface, message(error), "error");
		}
	}
}

function setMutationsEnabled(surface, enabled) {
	for (const form of [surface.folderForm, surface.fileForm]) {
		for (const control of form.elements) control.disabled = !enabled;
	}
}

function message(error) {
	return error?.message || String(error || "AwtsmoosDB request failed.");
}
