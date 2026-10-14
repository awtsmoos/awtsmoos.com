// B"H
// Boruch Hashem — explicit account-bound local device approval.
//
// The pairing page must work even when the session check is slow, the user
// is not logged in yet, or the installer URL was lost. It renders instantly
// from URL params, offers manual code entry as a fallback, and only talks
// to the server when the human taps Approve.

import { getJson } from "../api/http.js";

/** Human guidance for pairing failures — never leave anyone staring at a raw code. */
const FRIENDLY_PAIRING_ERRORS = {
	pairing_not_found: "This pairing code wasn't found — it probably expired or was already used. Re-run the installer on your server for a fresh code, then approve the new one.",
	pairing_expired: "This pairing code expired before it was approved. Re-run the installer on your server for a fresh code.",
	pairing_identity_conflict: "This device already has an active pairing that doesn't match. If you reinstalled, reset the device identity and pair fresh.",
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

/** Reads the pairing request from the URL. Returns null when this is not a pairing visit. */
export function getPairingRequest() {
	const parameters = new URLSearchParams(location.search);
	const userCode = String(parameters.get("pairingCode") || "").trim().toUpperCase();
	const manual = parameters.get("pairing") === "manual";
	if (!userCode && !manual) return null;
	return { userCode, manual };
}

/** Beautiful loading shell shown while the pairing page prepares. */
function showPairingLoading() {
	document.body.className = "awt-pairing-page";
	document.body.textContent = "";
	const card = document.createElement("main");
	card.className = "awt-pairing-card";
	card.innerHTML = `
		<div class="awt-mini-kicker">B"H · SECURE DEVICE PAIRING</div>
		<h1>Preparing secure pairing…</h1>
		<div class="awt-pairing-loading" aria-hidden="true"><span></span><span></span><span></span></div>
		<p class="awt-pairing-status" role="status" aria-live="polite">Checking your sign-in and the pairing request…</p>`;
	document.body.append(card);
	return card;
}

/** Mounts the approval card for a known code. Handles auth on Approve. */
function mountApprovalCard(card, code) {
	card.innerHTML = `
		<div class="awt-mini-kicker">B"H · SECURE DEVICE PAIRING</div>
		<h1>Approve this device?</h1>
		<p>A local Awtsmoos Tunnel requested access to this account. Approve only if you just ran the installer on your own machine.</p>
		<div class="awt-pairing-code" aria-label="Pairing code"></div>
		<div class="awt-pairing-actions">
			<button type="button" class="button-link primary" data-pair-approve>Approve this device</button>
			<button type="button" class="button-link" data-pair-cancel>Cancel</button>
		</div>
		<p class="awt-pairing-status" role="status" aria-live="polite"></p>`;
	card.querySelector(".awt-pairing-code").textContent = code;
	const status = card.querySelector(".awt-pairing-status");
	card.querySelector("[data-pair-cancel]").addEventListener("click", () => {
		location.href = "/apps/tunnel-control/";
	});
	card.querySelector("[data-pair-approve]").addEventListener("click", async event => {
		const button = event.currentTarget;
		button.disabled = true;
		status.classList.remove("awt-pairing-error");
		status.textContent = "Approving encrypted device identity…";
		const result = await getJson("/api/tunnel/control/pairing/approve", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ userCode: code })
		});
		if (!result.ok && (result.error === "unauthorized" || result.status === 401)) {
			// Not signed in — send through login, then come straight back here.
			const back = encodeURIComponent(location.pathname + location.search);
			location.href = `/login?return=${back}`;
			return;
		}
		if (!result.ok) {
			button.disabled = false;
			status.textContent = pairingFailureText(result);
			status.classList.add("awt-pairing-error");
			return;
		}
		status.textContent = "Device approved. Waiting for the tunnel to register…";
		setTimeout(() => { location.href = "/apps/tunnel-control/"; }, 1800);
	});
}

/** Mounts the manual code entry form for when the installer URL was lost. */
function mountManualEntry(card) {
	card.innerHTML = `
		<div class="awt-mini-kicker">B"H · SECURE DEVICE PAIRING</div>
		<h1>Enter your pairing code</h1>
		<p>The installer on your machine printed a short code. Type it here to approve that device.</p>
		<form class="awt-pairing-manual" data-pair-form>
			<input type="text" class="awt-pairing-input" data-pair-input
				placeholder="e.g. 5MFYRTEW" autocomplete="off" autocapitalize="characters"
				spellcheck="false" maxlength="16" aria-label="Pairing code" />
			<div class="awt-pairing-actions">
				<button type="submit" class="button-link primary">Continue</button>
				<button type="button" class="button-link" data-pair-cancel>Cancel</button>
			</div>
		</form>
		<p class="awt-pairing-status" role="status" aria-live="polite"></p>`;
	const status = card.querySelector(".awt-pairing-status");
	const input = card.querySelector("[data-pair-input]");
	card.querySelector("[data-pair-cancel]").addEventListener("click", () => {
		location.href = "/apps/tunnel-control/";
	});
	card.querySelector("[data-pair-form]").addEventListener("submit", event => {
		event.preventDefault();
		const code = String(input.value || "").trim().toUpperCase();
		if (code.length < 4) {
			status.textContent = "Type the full code from your installer's approval card.";
			status.classList.add("awt-pairing-error");
			input.focus();
			return;
		}
		mountApprovalCard(card, code);
	});
	input.focus();
}

/**
 * Renders the pairing page immediately — before session resolution — so the
 * human never stares at the wrong screen. Returns true when it took over.
 */
export function showPairingApprovalIfRequested() {
	const request = getPairingRequest();
	if (!request) return false;
	const card = showPairingLoading();
	// Let the loading shell paint before swapping in the real UI.
	requestAnimationFrame(() => {
		if (request.manual && !request.userCode) {
			mountManualEntry(card);
		} else {
			mountApprovalCard(card, request.userCode);
		}
	});
	return true;
}
