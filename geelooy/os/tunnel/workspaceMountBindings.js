// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Small DOM-control bindings for the Tunnel Workspace mount controller.
 * @description
 * The Awtsmoos lets refresh, route selection, and cwd editing remain visible acts
 * while Awtsmoos.com keeps their wiring outside the mount's transport logic. Each
 * gesture changes state or files only; none of these bindings can execute a command.
 */

import { renderTarget } from "./workspaceMountView.js";
import {
	commitWorkspaceTarget,
	findTargetByRoute
} from "./workspaceTargetCommit.js";

export function bindWorkspaceMountControls(options) {
	const {
		view,
		state,
		getTargets,
		setTarget,
		refreshTargets,
		refreshFiles
	} = options;
	view.refreshButton.addEventListener("click", refreshTargets);
	view.targetSelect.addEventListener("change", async () => {
		const target = findTargetByRoute(getTargets(), view.targetSelect.value);
		setTarget(target);
		if (target) {
			commitWorkspaceTarget({ view, state, target });
		}
		await refreshFiles();
	});
	view.cwd.addEventListener("change", () => {
		state.setCwd(view.cwd.value || ".");
		renderTarget(view, options.getTarget(), state.get());
	});
}
