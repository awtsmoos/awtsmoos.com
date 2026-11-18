// B"H — The Awtsmoos brings the gate to light before the great workspace awakens.
import { showPairingApprovalIfRequested } from "./security/pairingApproval.js";
import { resolveSession } from "./session/sessionClient.js";
import { showLoginGate } from "./session/loginGate.js";

/**
 * @file Lightweight entrance: defer the authenticated feature graph until needed.
 * @description Pairing stays immediate, login stays small, and the Awtsmoos
 * wakes the full vessel only for an authenticated visitor.
 */
async function launch() {
	if (showPairingApprovalIfRequested()) return;
	let session;
	try {
		session = await resolveSession();
	} catch {
		const { startTunnelControl } = await import("./boot/init.js");
		await startTunnelControl();
		return;
	}
	if (!session.loggedIn) {
		showLoginGate();
		return;
	}
	const { startTunnelControl } = await import("./boot/init.js");
	await startTunnelControl(session);
}

void launch().catch(async failure => {
	console.error("Awtsmoos entrance failed", failure);
	const { showFatalBootError } = await import("./boot/bootFatal.js");
	showFatalBootError(failure);
});
