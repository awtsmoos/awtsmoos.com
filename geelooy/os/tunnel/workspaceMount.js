// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Remote target, file-mount, and explicit Explorer-context controller.
 * @description
 * The Awtsmoos lets a verified remote route become a mounted Workspace while
 * Awtsmoos.com keeps friendly names secondary to immutable identity. Explorer may
 * offer a folder, but only exact-route adoption may change target/cwd; navigation,
 * selection, and file browsing remain powerless to execute a command by themselves.
 */

import {
	discoverTunnelTargets,
	listRemote,
	readRemote
} from "./remoteClient.js";
import { extractEntries, extractFileText } from "./workspaceData.js";
import { chooseTarget, createWorkspaceState } from "./workspaceState.js";
import { renderFiles, renderTargets } from "./workspaceMountView.js";
import { bindWorkspaceMountControls } from "./workspaceMountBindings.js";
import {
	adoptWorkspaceContext,
	findTargetByRoute
} from "./workspaceTargetCommit.js";

export function bindWorkspaceMount(view, options = {}) {
	const state = createWorkspaceState(options.storage || globalThis.localStorage);
	let targets = [];
	let target = null;

	async function refreshTargets() {
		try {
			targets = await discoverTunnelTargets(options.fetcher || globalThis.fetch);
			target = chooseTarget(targets, state.get());
			if (target) state.select(target);
			renderTargets(view, targets, target, state.get());
			await refreshFiles();
		} catch (error) {
			view.files.textContent = error.message;
		}
		return target;
	}

	async function refreshFiles() {
		if (!target?.canRead) {
			view.files.textContent = "Selected target does not expose readable files.";
			return;
		}
		try {
			const response = await listRemote(
				target,
				state.get().cwd,
				options.fetcher
			);
			renderFiles(view, extractEntries(response), openEntry);
		} catch (error) {
			view.files.textContent = error.message;
		}
	}

	async function openEntry(entry) {
		if (entry.directory) {
			state.setCwd(entry.path);
			view.cwd.value = entry.path;
			await refreshFiles();
			return;
		}
		try {
			const response = await readRemote(target, entry.path, options.fetcher);
			view.preview.textContent = extractFileText(response);
		} catch (error) {
			view.preview.textContent = error.message;
		}
	}

	async function adoptExplorerContext(context) {
		const matched = findTargetByRoute(targets, context?.route);
		if (!matched) {
			return Object.freeze({
				ok: false,
				error: "Explorer route is not a currently verified Workspace target."
			});
		}
		target = matched;
		const result = adoptWorkspaceContext({ view, state, targets, context });
		await refreshFiles();
		return result;
	}

	bindWorkspaceMountControls({
		view,
		state,
		getTargets: () => targets,
		getTarget: () => target,
		setTarget: value => { target = value; },
		refreshTargets,
		refreshFiles
	});

	return Object.freeze({
		getTarget: () => target,
		getState: () => state.get(),
		refreshTargets,
		adoptExplorerContext
	});
}
