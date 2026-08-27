// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Focused browser-tunnel telemetry panels for Awtsmoos Code.
 * @description
 * The Awtsmoos lets agent, mission, action, and runtime testimony appear without
 * enlarging the authority-switch view. Awtsmoos.com escapes every dynamic value
 * so browser-tunnel telemetry remains readable data rather than executable markup.
 */

export function agentsMarkup(sessions = []) {
	if (!sessions.length) {
		return empty("No external agent has used this tab yet.");
	}
	return sessions.map(session => `
		<article class="code-agent-row">
			<div><strong>${escapeHtml(session.agentName || session.logicalAgentId)}</strong><small>${escapeHtml(session.logicalAgentId)}</small></div>
			<span>${escapeHtml(session.lastAction || "idle")}</span>
			<small>${escapeHtml(session.missionTitle || session.missionId || "No mission assigned")}</small>
			<small>${relative(session.lastSeenAt)} · ${Number(session.activeRequests || 0)} active</small>
		</article>`).join("");
}

export function missionsMarkup(missions = []) {
	if (!missions.length) {
		return empty("Mission activity will appear here.");
	}
	return missions.map(mission => `
		<article class="code-mission-row">
			<strong>${escapeHtml(mission.title || mission.missionId || "Unassigned mission")}</strong>
			<small>${Number(mission.agentCount || 0)} agents · ${Number(mission.activeRequests || 0)} active actions</small>
			<small>${escapeHtml(mission.roomId || mission.missionId || "")}</small>
		</article>`).join("");
}

export function actionsMarkup(actions = []) {
	if (!actions.length) {
		return empty("Filesystem, command, preview, and browser actions will stream here.");
	}
	return actions.slice(0, 80).map(action => `
		<article class="code-action-row" data-state="${escapeHtml(action.state)}">
			<span class="code-action-row__state">${escapeHtml(action.state)}</span>
			<div><strong>${escapeHtml(action.action)}</strong><small>${escapeHtml(action.logicalAgentId)}</small></div>
			<small>${escapeHtml(action.path || action.tabId || action.requestId || "")}</small>
			<time>${relative(action.finishedAt || action.startedAt)}</time>
		</article>`).join("");
}

export function runtimeMarkup(model = {}) {
	const runtime = model.runtime || {};
	const target = model.browserTarget || {};
	return `<dl class="code-runtime-list">
		<dt>Browser runtime</dt><dd>${escapeHtml(runtime.summary || "Browser Worker runtime")}</dd>
		<dt>Native delegation</dt><dd>${runtime.nativeDelegation?.enabled ? "Available through a separate native tunnel" : "Not connected"}</dd>
		<dt>Active browser target</dt><dd>${escapeHtml(target.activeTargetId || "None mounted")}</dd>
		<dt>Browser actions</dt><dd>Navigate, click, type, find, wait, snapshot and eval in Code Browser</dd>
	</dl>`;
}

export function panel(title, body, className = "") {
	return `<section class="code-tunnel-panel ${escapeHtml(className)}"><h3>${escapeHtml(title)}</h3><div>${body}</div></section>`;
}

export function escapeHtml(value) {
	return String(value ?? "").replace(/[&<>"']/g, character => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#39;"
	})[character]);
}

function relative(value) {
	const time = Date.parse(value || "");
	if (!Number.isFinite(time)) {
		return "now";
	}
	const seconds = Math.max(0, Math.round((Date.now() - time) / 1000));
	return seconds < 60 ? `${seconds}s ago` : `${Math.floor(seconds / 60)}m ago`;
}

function empty(text) {
	return `<p class="code-tunnel-empty">${escapeHtml(text)}</p>`;
}
