// B"H

import { getJson } from "../api/http.js";

const INSTALL_COMMAND = "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash";

/** Human guidance for pairing failures — never leave anyone staring at a raw code. */
const FRIENDLY_PAIRING_ERRORS = {
	pairing_not_found: "This pairing code wasn't found — it probably expired or was already used. Re-run the installer on your server for a fresh code, then approve the new one.",
	pairing_expired: "This pairing code expired before it was approved. Re-run the installer on your server for a fresh code.",
	pairing_identity_conflict: "This device is already paired to a different account. Approve from the account it was paired with, or reset the device identity and pair fresh.",
	pairing_binding_invalid: "Pairing couldn't be completed because of an identity mismatch. Re-run the installer for a fresh code."
};

/** Prefers the server's friendly message, falls back to the local map, then the raw code. */
function pairingFailureText(result) {
	if (result && typeof result.message === "string" && result.message.trim()) {
		return result.message;
	}
	const code = String(result?.error || "unknown_error");
	return FRIENDLY_PAIRING_ERRORS[code] || `Pairing failed: ${code}. Re-run the installer on your server for a fresh code.`;
}

/** Mounts an explicit, authenticated approval boundary for a local device. */
export function showPairingApprovalIfRequested() {
	const parameters = new URLSearchParams(location.search);
	const userCode = String(parameters.get("pairingCode") || "").trim();
	if (!userCode) return false;
	document.body.className = "awt-pairing-page";
	document.body.textContent = "";
	const card = document.createElement("main");
	card.className = "awt-pairing-card";
	card.innerHTML = `
		<div class="awt-mini-kicker">B&quot;H · SECURE DEVICE PAIRING</div>
		<h1>Approve this Mac tunnel?</h1>
		<p>A local Awtsmoos Tunnel requested access to this account. Approve only if you just ran the installer on your own machine.</p>
		<div class="awt-pairing-code" aria-label="Pairing code"></div>
		<div class="awt-pairing-actions">
			<button type="button" class="button-link primary" data-pair-approve>Approve this device</button>
			<button type="button" class="button-link" data-pair-cancel>Cancel</button>
		</div>
		<p class="awt-pairing-status" role="status" aria-live="polite"></p>`;
	card.querySelector(".awt-pairing-code").textContent = userCode;
	document.body.append(card);
	const status = card.querySelector(".awt-pairing-status");
	card.querySelector("[data-pair-cancel]").addEventListener("click", () => {
		location.href = "/apps/tunnel-control/";
	});
	card.querySelector("[data-pair-approve]").addEventListener("click", async event => {
		const button = event.currentTarget;
		button.disabled = true;
		status.textContent = "Approving encrypted device identity…";
		const result = await getJson("/api/tunnel/control/pairing/approve", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ userCode })
		});
		if (!result.ok) {
			button.disabled = false;
			status.textContent = pairingFailureText(result);
			return;
		}
		status.textContent = "Device approved. Waiting for the tunnel to register…";
		setTimeout(() => { location.href = "/apps/tunnel-control/"; }, 1800);
	});
	return true;
}
