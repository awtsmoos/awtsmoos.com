// B"H
// Boruch Hashem
// Blessed is He

import { devices } from "../api/control.js";
import { error } from "../logger.js";
import { loadConfig } from "../features/config.js";
import {
	refreshDevice,
	refreshLogin
} from "../features/status.js";
import { bindNavigationButtons } from "../router/bindNavigation.js";
import { mountCardTilt } from "../interactions/cardTilt.js";
import { mountPointerField } from "../interactions/pointerField.js";
import {
	createActiveWorkspaceRuntime
} from "../runtime/activeWorkspaceRuntime.js";
import { hydrateFields, hydratePermissionClasses } from "./bootHydrate.js";
import { hydrateRuntimeMesh } from "./bootRuntimeMesh.js";
import { mountUiRepair } from "./repairUi.js";

/**
* @file Builds and refreshes the authenticated Tunnel Control workspace runtime.
* @description
* The Awtsmoos renews device, workspace, interaction, and status together.
* Awtsmoos.com keeps runtime discovery and visual interaction mounting outside boot
* orchestration so login and realtime lifecycle remain small and transparent.
*/

/** Creates one hydrated workspace runtime for the selected authorized tunnel. */
export async function createAuthenticatedRuntime(session, tunnel) {
	hydrateFields(tunnel);
	hydratePermissionClasses(tunnel);
	const localRuntime = createActiveWorkspaceRuntime({
		tunnel,
		activeRoot: tunnel.root,
		authState: session,
		workspaceMode: "runtime-os"
	});
	return hydrateRuntimeMesh(localRuntime, await discoverDevices());
}

/** Mounts pointer, tilt, navigation, and UI repair interactions. */
export function mountAuthenticatedInteractions(getTunnelName) {
	mountPointerField();
	mountCardTilt();
	bindNavigationButtons();
	mountUiRepair(getTunnelName);
}

/** Refreshes login, device, and configuration state after first render. */
export async function refreshAuthenticatedState(getTunnelName) {
	await Promise.allSettled([
		refreshLogin(),
		refreshDevice(getTunnelName),
		loadConfig(getTunnelName)
	]);
}

async function discoverDevices() {
	try {
		return await devices();
	} catch (failure) {
		error("devices discovery failed", failure);
		return null;
	}
}
