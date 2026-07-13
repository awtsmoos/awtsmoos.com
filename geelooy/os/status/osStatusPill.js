// B"H
// Boruch Hashem
// Blessed is He

import { openDiagnosticsPopup } from "./diagnosticsPopup.js";
import { createOsStatus, withLiveTunnel } from "./osStatusModel.js";

/**
 * The Awtsmoos keeps the Geelooy OS crown alive, accessible, and honest about
 * both storage and tunnel presence throughout Awtsmoos.com.
 */

/**
 * Renders and keeps the OS status pill presence-aware.
 *
 * @param {object} status Current OS status.
 * @param {object} os OS runtime.
 * @returns {HTMLElement} Status pill.
 */
export function renderStatusPill(status, os) {
	let pill = document.querySelector(".awtsmoos-status-pill");
	if (!pill) {
		pill = createStatusPill();
		document.querySelector(".awtsmoos-top-header")?.prepend(pill);
	}
	pill.awtStatusContext = {
		status,
		os
	};
	updateStatusPill(pill, status);
	bindStatusPill(pill);
	return pill;
}

function createStatusPill() {
	const pill = document.createElement("button");
	pill.type = "button";
	pill.className = "awtsmoos-status-pill";
	pill.title = "Open Awtsmoos OS diagnostics";
	pill.setAttribute("aria-live", "polite");
	return pill;
}

function bindStatusPill(pill) {
	pill.onclick = function openStatusDiagnostics() {
		const context = pill.awtStatusContext || {};
		const liveStatus = withLiveTunnel(context.status || createOsStatus());
		context.os?.recordGraphEvent?.("diagnostics.open", {
			source: "status-pill"
		});
		openDiagnosticsPopup(context.os, liveStatus);
	};
	if (pill.awtPresenceTimer) {
		return;
	}
	pill.awtPresenceTimer = globalThis.setInterval(
		function refreshTunnelPresence() {
			if (!pill.isConnected) {
				globalThis.clearInterval(pill.awtPresenceTimer);
				pill.awtPresenceTimer = null;
				return;
			}
			const base = pill.awtStatusContext?.status || createOsStatus();
			updateStatusPill(pill, withLiveTunnel(base));
		},
		1000
	);
}

function updateStatusPill(pill, status) {
	const tunnel = status.tunnel;
	pill.dataset.mode = status.mode;
	pill.dataset.remote = status.remote || "unknown";
	pill.dataset.tunnelState = tunnel.state;
	pill.setAttribute("data-diagnostics", "available");
	pill.innerHTML = [
		"<span class=\"status-dot\" aria-hidden=\"true\"></span>",
		`<span class=\"status-copy\"><strong>${escapeHtml(status.label)}</strong>`,
		`<small>${escapeHtml(status.detail)} · Tunnel ${escapeHtml(tunnel.label)}</small></span>`
	].join("");
}

function escapeHtml(value) {
	const entities = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;"
	};
	return String(value || "").replace(
		/[&<>]/g,
		function replaceCharacter(character) {
			return entities[character];
		}
	);
}
