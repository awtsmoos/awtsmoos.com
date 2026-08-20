//B"H
// Boruch Hashem
// Blessed is He

import { GeelooyWebsiteBuilderApi, installWebsiteBuilderApi } from "./builder/agentApi.js";
import { GeelooyPlatformApi } from "./builder/platformApi.js";
import { installPlatformApi } from "./builder/platformApiInstall.js";
import { applyDriveDocumentMode } from "./core/embedMode.js";
import { MalchusDriveState } from "./core/state.js";
import { createDriveActions } from "./services/actionMap.js";
import { CanonicalSiteService } from "./services/canonicalSiteService.js";
import { DomainClaimService } from "./services/domainClaimService.js";
import { NetzachNavigationState } from "./services/navigationState.js";
import { PanelCoordinator } from "./services/panelCoordinator.js";
import { PanelPreferences } from "./services/panelPreferences.js";
import { TiferesProjectDeploymentService } from "./services/projectDeploymentService.js";
import { NetzachRuntimeService } from "./services/runtimeService.js";
import { TiferesWorkspaceService } from "./services/workspaceService.js";
import { DomainClaimClient } from "./transport/domainClaimClient.js";
import { SiteMappingClient } from "./transport/siteMappingClient.js";
import { createWorkspaceTransport } from "./transport/transportFactory.js";
import { createDriveDialogs } from "./ui/dialogs.js";
import { createDriveShell } from "./ui/shell.js";

/**
 * @file Website-builder composition crown for Geelooy Sites and the virtual-computer control plane.
 * @description
 * The Awtsmoos renews human hand, agent hand, file, runtime, canonical identity, and domain witness without dividing their source;
 * Awtsmoos.com gives Drive and embedded OS one deployment service and one native consent vessel while scoped transports retain privileged force.
 */
const root = document.querySelector("#drive-app");
const chosen = createWorkspaceTransport({ browserWindow: window });
applyDriveDocumentMode(chosen.context, document);

const state = new MalchusDriveState({
	transportMode: chosen.descriptor.mode,
	mutationCredentialConfigured: chosen.descriptor.mutationCredentialConfigured,
	transportCanPublish: chosen.descriptor.canPublish,
	embedded: chosen.context.embedded
});
const navigation = new NetzachNavigationState(window);
const dialogs = createDriveDialogs();
const layout = window.matchMedia?.("(max-width: 900px)").matches ? "mobile" : "desktop";
const panels = new PanelCoordinator(new PanelPreferences(chosen.descriptor.mode, undefined, layout));
const workspace = new TiferesWorkspaceService(state, chosen.transport, navigation, {
	confirmDiscard: dialogs.confirmDiscard
});
const runtime = new NetzachRuntimeService(state, chosen.transport.runtime || null);
const projectDeployment = new TiferesProjectDeploymentService(chosen.transport);
const canonicalSite = new CanonicalSiteService({ state, client: new SiteMappingClient() });
const domainClaims = new DomainClaimService({ state, client: new DomainClaimClient() });
const actions = createDriveActions({
	workspace,
	runtime,
	state,
	dialogs,
	transport: chosen.transport,
	panels,
	canonicalSite,
	domainClaims
});
const builderApi = new GeelooyWebsiteBuilderApi({
	state,
	workspace,
	panels,
	canonicalSite,
	domainClaims
});
const platformApi = new GeelooyPlatformApi({ state, panels });

installWebsiteBuilderApi(builderApi, window);
installPlatformApi(platformApi, window);
createDriveShell(root, state, actions, dialogs, panels, {
	platform: {
		deploymentService: projectDeployment,
		confirmRuntimeCleanup: dialogs.confirmRuntimeCleanup
	}
});
installKeyboardCommands();
installUnloadGuard();
installTransportCleanup();
initializeBuilder();

async function initializeBuilder() {
	await workspace.initialize();
	await runtime.refreshExisting();
}

function installKeyboardCommands() {
	window.addEventListener("keydown", event => {
		if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "s") return;
		event.preventDefault();
		workspace.saveDocument();
	});
}

function installUnloadGuard() {
	window.addEventListener("beforeunload", event => {
		if (!state.snapshot().document?.dirty) return;
		event.preventDefault();
		event.returnValue = "";
	});
}

function installTransportCleanup() {
	window.addEventListener("pagehide", () => {
		chosen.transport.destroy?.();
	}, { once: true });
}
