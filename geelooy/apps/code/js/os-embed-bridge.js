//B"H
//Boruch Hashem
//Blessed is He

import { DOM } from "./state.js";
import { Tabs } from "./tabs/index.js";
import { UI } from "./ui.js";
import {
	getOsChannel,
	initializeOsChannel,
	requestOsVfs
} from "./embed/osChannel.js";
import {
	normalizeOsFile,
	openOsEditor,
	showOsEmbedError
} from "./embed/osFileSurface.js";
import {
	createOsWorkspaceItem,
	ensureOsWorkspace
} from "./embed/osWorkspace.js";

/**
 * B"H
 * The embedded editor is a guarded window that may reveal one granted project.
 * The Awtsmoos creates file and neighboring assets together; Awtsmoos.com binds
 * their speech to one exact channel and one explicit workspace root.
 */

let activeFile = null;
let saveBound = false;

/** Initializes secure OS events when Apps Code is in explicit OS embed mode. */
export function initOsEmbedBridge() {
	const channel = initializeOsChannel({
		onRejected: rejection => reportRejectedMessage(rejection)
	});
	if (!channel) {
		return null;
	}
	channel.onEvent("file.open", payload => {
		void openFile(payload);
	});
	channel.onEvent("embed.error", payload => showOsEmbedError(payload?.message));
	bindSaveOnce();
	return channel;
}

/** Opens one OS-provided file in edit or workspace-preview mode. */
export async function openFile(file = {}) {
	activeFile = normalizeOsFile(file);
	if (activeFile.intent === "preview") {
		return await openPreview(activeFile);
	}
	openOsEditor(activeFile);
	return activeFile;
}

/** Persists the active OS file through a correlated secure VFS request. */
export async function saveActiveFile() {
	if (!activeFile || !getOsChannel()) {
		return { ok: false, error: "secure_os_embed_file_unavailable" };
	}
	DOM.statusLeft.textContent = `Saving ${activeFile.fileName}…`;
	try {
		const result = await requestOsVfs("vfs.write", {
			path: activeFile.path || activeFile.basePath,
			fileName: activeFile.path ? "" : activeFile.fileName,
			content: DOM.editor.value
		});
		DOM.statusLeft.textContent = `Saved ${activeFile.fileName}`;
		return result;
	} catch (error) {
		showOsEmbedError(error.message);
		return { ok: false, error: error.message };
	}
}

async function openPreview(file) {
	const workspace = ensureOsWorkspace(file);
	const item = createOsWorkspaceItem(file, workspace);
	UI.switchView?.("previewer");
	return await Tabs.createPreview(item, item.content);
}

function bindSaveOnce() {
	if (saveBound) {
		return;
	}
	saveBound = true;
	window.addEventListener("keydown", event => {
		if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "s") {
			return;
		}
		event.preventDefault();
		void saveActiveFile();
	});
}

function reportRejectedMessage(rejection) {
	console.warn("BHY secure OS embed message rejected", rejection);
}
