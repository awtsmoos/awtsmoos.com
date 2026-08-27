//B"H
// Boruch Hashem
// Blessed is He

import { parentPathForBrowser } from "../ui/fileBrowser.js";
import { createBuilderActions } from "./builderActions.js";
import { createDomainActions } from "./domainActions.js";

/**
 * @file Unified human-intention map for Geelooy Website Builder and Drive.
 * @description
 * The Awtsmoos joins website intention with files, runtime, temporary preview, canonical publication, custom-domain proof, and authority while Awtsmoos.com preserves every original scope;
 * a creator sees one product vocabulary, yet durable site mapping, domain ownership, and Tunnel preview remain different services with different proof.
 */

export function createDriveActions(options) {
	const {
		workspace,
		runtime,
		state,
		dialogs,
		transport,
		panels,
		canonicalSite,
		domainClaims
	} = options;
	return {
		...createBuilderActions({ workspace, state, panels, canonicalSite }),
		...createDomainActions({ domainClaims, panels }),
		navigate: path => workspace.navigate(path),
		navigateUp: () => workspace.navigate(parentPathForBrowser(state.snapshot().currentPath)),
		selectDevice: route => workspace.selectDevice(route),
		openEntry: entry => openEntry(workspace, panels, entry),
		setDraft: content => workspace.setDraft(content),
		setFilter: filter => workspace.setFilter(filter),
		save: () => workspace.saveDocument(),
		refresh: () => workspace.refresh(),
		reconnect: async () => {
			if (await workspace.mayDiscard()) await workspace.initialize();
		},
		newFile: () => createFile(workspace, dialogs, panels),
		newFolder: () => createFolder(workspace, dialogs),
		publish: () => publishFolder(workspace, dialogs, state, panels),
		revokePreview: id => workspace.revokePreview(id),
		setMutationKey: value => setScopedKey(transport, runtime, state, value),
		clearMutationKey: () => clearScopedKey(transport, state),
		runtimeStart: () => runtimeAction(runtime.startCurrentFolder(), panels),
		runtimeExpose: () => runtimeAction(runtime.exposePublic(), panels),
		runtimeLogs: () => runtimeAction(runtime.refreshLogs(), panels),
		runtimeStop: () => runtime.stop()
	};
}

async function openEntry(workspace, panels, entry) {
	const result = await workspace.openEntry(entry);
	if (result !== false && entry.type !== "directory") reveal(panels, "editor");
	return result;
}

async function createFile(workspace, dialogs, panels) {
	const name = await dialogs.askName("file");
	if (!name) return false;
	const result = await workspace.createFile(name);
	if (result !== false) reveal(panels, "editor");
	return result;
}

async function createFolder(workspace, dialogs) {
	const name = await dialogs.askName("folder");
	return name ? await workspace.createFolder(name) : false;
}

async function publishFolder(workspace, dialogs, state, panels) {
	if (!state.snapshot().transportCanPublish) return unavailablePublish(state);
	const options = await dialogs.askPublish();
	if (!options) return false;
	const result = await workspace.publishCurrentFolder(options);
	if (result !== false) reveal(panels, "cloud");
	return result;
}

async function runtimeAction(promise, panels) {
	const result = await promise;
	if (result !== false) reveal(panels, "runtime");
	return result;
}

async function setScopedKey(transport, runtime, state, value) {
	const configured = Boolean(transport.setMutationApiKey?.(value));
	state.patch({
		mutationCredentialConfigured: configured,
		error: "",
		message: configured ? "Scoped Tunnel key loaded for this tab." : "Scoped Tunnel key was empty."
	});
	if (configured) await runtime.refreshExisting();
}

function clearScopedKey(transport, state) {
	transport.clearMutationApiKey?.();
	state.patch({ mutationCredentialConfigured: false, message: "Scoped Tunnel key cleared from this tab." });
}

function reveal(panels, panelId) {
	panels.open(panelId, { scroll: panels.isMobile(), focus: false });
}

function unavailablePublish(state) {
	state.patch({ error: "Preview publishing requires a Tunnel-backed project. The OS VFS workspace remains private." });
	return false;
}
