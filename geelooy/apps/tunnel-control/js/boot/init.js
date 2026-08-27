// B"H
// Boruch Hashem
// Blessed is He

import { log, error } from "../logger.js";
import { startActivitySession, stopActivitySession } from "../realtime/activitySession.js";
import { resolveSession } from "../session/sessionClient.js";
import { showLoginGate } from "../session/loginGate.js";
import { showPairingApprovalIfRequested } from "../security/pairingApproval.js";
import { mountShell } from "../shell/mountShell.js";
import { resolveActiveTunnel } from "../tunnels/tunnelResolver.js";
import { showNoTunnelView } from "../tunnels/noTunnelView.js";
import { getProjectPath, getTunnelName } from "./bootAccessors.js";
import {
	createAuthenticatedRuntime,
	mountAuthenticatedInteractions,
	refreshAuthenticatedState
} from "./authenticatedRuntime.js";
import { mountAuthenticatedLifecycle } from "./authenticatedLifecycle.js";
import { showFatalBootError } from "./bootFatal.js";
import { mountLegacyFeatures } from "./mountLegacyFeatures.js";
import { renderPrompt } from "./renderPrompt.js";
import { wireInputs } from "./wireInputs.js";

/**
* @file Boots Tunnel Control as one authenticated account and realtime lifecycle.
* @description
* The Awtsmoos renews login, tunnel, workspace, and stream in one living field.
* Awtsmoos.com keeps boot as a readable sequence while runtime construction,
* interactions, polling, and disposal live in focused supporting vessels.
*/
export async function startTunnelControl() {
	try {
		log("boot account-bound realtime control center");
		const session = await resolveSession();
		if (!session.loggedIn) {
			stopActivitySession();
			return showLoginGate();
		}
		if (showPairingApprovalIfRequested()) return;
		const activityRuntime = startActivitySession(session);
		const tunnel = await resolveActiveTunnel();
		if (!tunnel.ok) {
			mountAuthenticatedLifecycle(session, getTunnelName);
			return showNoTunnelView();
		}
		const runtime = await createAuthenticatedRuntime(session, tunnel);
		window.awtsGetTunnelName = getTunnelName;
		wireInputs(getTunnelName);
		await mountLegacyFeatures(getTunnelName);
		renderPrompt(getTunnelName);
		mountShell({
			session,
			runtime,
			activityRuntime,
			getTunnelName,
			getProjectPath
		});
		mountAuthenticatedInteractions(getTunnelName);
		await refreshAuthenticatedState(getTunnelName);
		mountAuthenticatedLifecycle(session, getTunnelName);
	} catch (failure) {
		stopActivitySession();
		showFatalBootError(failure);
		error("fatal app boot error", failure);
	}
}
