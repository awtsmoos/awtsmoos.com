// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Consent-explicit authority console for the Code browser tunnel.
 * @description
 * The Awtsmoos lets one Code tab become a temporary peer while remembered permission
 * may invite a future Code opening to reconnect. Awtsmoos.com shows those two truths
 * separately, keeps native shell authority outside this browser vessel, and lets the
 * human stop the present peer without silently forgetting a different future choice.
 */

import {
	actionsMarkup,
	agentsMarkup,
	escapeHtml,
	missionsMarkup,
	panel,
	runtimeMarkup
} from "./markupPanels.js";

export function tunnelConsoleMarkup(model = {}) {
	const active = isActive(model.status);
	return `
		<header class="code-tunnel-console__header">
			<div>
				<p class="code-kicker">External AI browser peer</p>
				<h2>Code browser tunnel</h2>
				<p class="code-tunnel-console__hint">Closing this tab ends the current browser peer. If permission is remembered, Code may reconnect when Code is opened again. Native shell power still requires a native tunnel.</p>
			</div>
			<div class="code-tunnel-console__header-actions">
				<span class="code-tunnel-badge" data-state="${escapeHtml(model.status)}">${escapeHtml(model.status || "idle")}</span>
				<button type="button" data-tunnel-action="close" aria-label="Close tunnel console">×</button>
			</div>
		</header>
		<section class="code-tunnel-console__summary">
			${metric("Consent", model.consentLabel || "Disabled")}
			${metric("Display name", model.tunnelName || "Not named")}
			${metric("Agents", String(model.agentCount || 0))}
			${metric("Reconnect attempt", String(model.reconnectAttempt || 0))}
		</section>
		<section class="code-tunnel-console__controls">
			<button type="button" data-tunnel-action="start-session" ${active ? "disabled" : ""}>Enable for this session</button>
			<button type="button" data-tunnel-action="start-remembered" ${active ? "disabled" : ""}>Enable + remember</button>
			<button type="button" data-tunnel-action="stop" ${active ? "" : "disabled"}>Stop now</button>
			<button type="button" data-tunnel-action="forget" ${model.remembered ? "" : "disabled"}>Forget remembered permission</button>
			<a href="/apps/tunnel-control/" target="_blank" rel="noopener">Open Tunnel Control</a>
		</section>
		${errorMarkup(model.lastError)}
		<div class="code-tunnel-console__grid">
			${panel("Agents", agentsMarkup(model.sessions || []))}
			${panel("Missions", missionsMarkup(model.missions || []))}
			${panel("Live actions", actionsMarkup(model.actions || []), "code-tunnel-actions")}
			${panel("Runtime and browser", runtimeMarkup(model))}
		</div>`;
}

function metric(label, value) {
	return `<div><small>${escapeHtml(label)}</small><strong>${escapeHtml(value)}</strong></div>`;
}

function errorMarkup(error) {
	return error
		? `<p class="code-tunnel-error" role="alert">${escapeHtml(error)}</p>`
		: "";
}

function isActive(status) {
	return ["connected", "connecting", "registered", "ready", "reconnecting"].includes(
		String(status || "").toLowerCase()
	);
}
