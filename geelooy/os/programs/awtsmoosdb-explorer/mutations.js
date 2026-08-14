// B"H
// Boruch Hashem
// Blessed is He

import {
	createDbFolder,
	createDbTextFile
} from "./api.js";
import { renderStatus } from "./render.js";

/**
 * B"H
 *
 * Owns only the two first safe AwtsmoosDB Explorer mutations: create hosted folder
 * and create non-empty text file. The Awtsmoos renews name, content, and result;
 * Awtsmoos.com keeps delete/move/copy outside this first release until navigation
 * and write behavior are browser-proven against the exact alias API.
 */

export function createDbMutations(surface, os, state, navigation) {
	return Object.freeze({
		createFile,
		createFolder
	});

	async function createFolder(event) {
		event.preventDefault();
		try {
			const path = await createDbFolder(os, state.path, surface.folderName.value);
			surface.folderName.value = "";
			renderStatus(surface, `Created folder ${path}.`);
			await navigation.refresh();
		} catch (error) {
			renderStatus(surface, message(error), "error");
		}
	}

	async function createFile(event) {
		event.preventDefault();
		try {
			const path = await createDbTextFile(
				os,
				state.path,
				surface.fileName.value,
				surface.content.value
			);
			surface.fileName.value = "";
			surface.content.value = "";
			renderStatus(surface, `Created text file ${path}.`);
			await navigation.refresh();
		} catch (error) {
			renderStatus(surface, message(error), "error");
		}
	}
}

function message(error) {
	return error?.message || String(error || "AwtsmoosDB write failed.");
}
