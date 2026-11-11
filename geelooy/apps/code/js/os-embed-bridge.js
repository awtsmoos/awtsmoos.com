//B"H
//Boruch Hashem
//Blessed is He

import { DOM, State } from "./state.js";
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
	// TEMPORARY DIAGNOSTIC (embed open witness): stage breadcrumbs land in
	// the status bar, and any failure becomes the visible document, because
	// this seam's failures are otherwise swallowed by console-only logs.
	let stage = "received";
	try {
		DOM.statusLeft.textContent = `OS open: ${stage} ${activeFile.fileName}`;
		stage = "workspace";
		const workspace = ensureOsWorkspace(activeFile);
		DOM.statusLeft.textContent = `OS open: ${stage} ${workspace.path}`;
		stage = "item";
		const item = createOsWorkspaceItem(activeFile, workspace);
		stage = "tab-create";
		DOM.statusLeft.textContent = `OS open: ${stage} ${item.path}`;
		const tab = await Tabs.create(item, false, true, true);
		stage = "verify";
		let found = State.tabs.find(t => t.id === tab?.id);
		if (!found) {
			// B"H - self-heal: a late state restore (or a build-freshness
			// reload of a sibling layer) can wipe a just-created tab from
			// State. Recreate it once on the settled state rather than
			// losing the owner's file to a boot race.
			await new Promise(resolve => setTimeout(resolve, 2500));
			const retried = await Tabs.create(item, false, true, true);
			found = State.tabs.find(t => t.id === retried?.id);
			if (found && State.activeTabId === retried?.id) {
				DOM.statusLeft.textContent = `OS file: ${activeFile.fileName}`;
				return activeFile;
			}
		}
		if (!found || State.activeTabId !== tab?.id) {
			let probe = "probe-skipped";
			try {
				const { OSFolderProvider } = await import("./fs/os-folder.js");
				const content = await OSFolderProvider.read(item);
				probe = `probe-read-ok len=${String(content).length}`;
			} catch (probeError) {
				probe = `probe-read-failed ${probeError?.message || probeError}`;
			}
			throw new Error(
				`tab-not-active id=${tab?.id} found=${!!found} active=${State.activeTabId} tabs=${State.tabs.length} itemContentLen=${String(item.content ?? "").length} ${probe}`
			);
		}
		DOM.statusLeft.textContent = `OS file: ${activeFile.fileName}`;
	} catch (error) {
		openOsEditor({
			...activeFile,
			content: `OS-EMBED-DIAGNOSTIC stage=${stage} error=${error?.message || error}`
		});
	}
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
