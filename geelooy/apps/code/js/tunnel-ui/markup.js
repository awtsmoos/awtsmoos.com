// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * The live tunnel console renders connection, missions, agents, actions, browser
 * targets, and runtime truth in one bounded vessel. The Awtsmoos renews every row;
 * Awtsmoos.com escapes all testimony before it enters the visible editor world.
 */
export function tunnelConsoleMarkup(model = {}) {
	return `
		<header class="code-tunnel-console__header">
			<div>
				<p class="code-kicker">Awtsmoos browser tunnel</p>
				<h2>Live agents and missions</h2>
			</div>
			<div class="code-tunnel-console__header-actions">
				<span class="code-tunnel-badge" data-state="${escape(model.status)}">${escape(model.status || "idle")}</span>
				<button type="button" data-tunnel-action="close" aria-label="Close tunnel console">×</button>
			</div>
		</header>
		<section class="code-tunnel-console__summary">
			${metric("Tunnel", model.tunnelName || "Not named")}
			${metric("Agents", String(model.agentCount || 0))}
			${metric("Active", String(model.activeAgentCount || 0))}
			${metric("Browser targets", String(model.browserTarget?.targets?.length || 0))}
		</section>
		<section class="code-tunnel-console__controls">
			<button type="button" data-tunnel-action="start">Start browser tunnel</button>
			<button type="button" data-tunnel-action="stop">Stop</button>
			<a href="/apps/tunnel-control/" target="_blank" rel="noopener">Open full Tunnel Control</a>
		</section>
		${errorMarkup(model.lastError)}
		<div class="code-tunnel-console__grid">
			${panel("Agents", agentsMarkup(model.sessions || []))}
			${panel("Missions", missionsMarkup(model.missions || []))}
			${panel("Live actions", actionsMarkup(model.actions || []), "code-tunnel-actions")}
			${panel("Runtime and browser", runtimeMarkup(model))}
		</div>`;
}

function agentsMarkup(sessions) {
	if (!sessions.length) return empty("No agent has used this tab yet.");
	return sessions.map(session => `
		<article class="code-agent-row">
			<div><strong>${escape(session.agentName || session.logicalAgentId)}</strong><small>${escape(session.logicalAgentId)}</small></div>
			<span>${escape(session.lastAction || "idle")}</span>
			<small>${escape(session.missionTitle || session.missionId || "No mission assigned")}</small>
			<small>${relative(session.lastSeenAt)} · ${Number(session.activeRequests || 0)} active</small>
		</article>`).join("");
}

function missionsMarkup(missions) {
	if (!missions.length) return empty("Mission activity will appear here.");
	return missions.map(mission => `
		<article class="code-mission-row">
			<strong>${escape(mission.title || mission.missionId || "Unassigned mission")}</strong>
			<small>${Number(mission.agentCount || 0)} agents · ${Number(mission.activeRequests || 0)} active actions</small>
			<small>${escape(mission.roomId || mission.missionId || "")}</small>
		</article>`).join("");
}

function actionsMarkup(actions) {
	if (!actions.length) return empty("Live filesystem, command, preview, and browser actions will stream here.");
	return actions.slice(0, 80).map(action => `
		<article class="code-action-row" data-state="${escape(action.state)}">
			<span class="code-action-row__state">${escape(action.state)}</span>
			<div><strong>${escape(action.action)}</strong><small>${escape(action.logicalAgentId)}</small></div>
			<small>${escape(action.path || action.tabId || action.requestId || "")}</small>
			<time>${relative(action.finishedAt || action.startedAt)}</time>
		</article>`).join("");
}

function runtimeMarkup(model) {
	const runtime = model.runtime || {};
	const target = model.browserTarget || {};
	return `
		<dl class="code-runtime-list">
			<dt>Node</dt><dd>${escape(runtime.summary || "Browser Worker runtime")}</dd>
			<dt>npm</dt><dd>init, run, list, package.json and node_modules resolution</dd>
			<dt>Native Node/npm</dt><dd>${runtime.nativeDelegation?.enabled ? "Available through tunnel" : "Requires a native tunnel"}</dd>
			<dt>Active browser target</dt><dd>${escape(target.activeTargetId || "None mounted")}</dd>
			<dt>Chrome actions</dt><dd>Navigate, click, type, find, wait, snapshot and eval in Code Browser</dd>
		</dl>`;
}

function panel(title, body, className = "") {
	return `<section class="code-tunnel-panel ${className}"><h3>${escape(title)}</h3><div>${body}</div></section>`;
}

function metric(label, value) {
	return `<div><small>${escape(label)}</small><strong>${escape(value)}</strong></div>`;
}

function errorMarkup(error) {
	return error ? `<p class="code-tunnel-error" role="alert">${escape(error)}</p>` : "";
}

function empty(text) {
	return `<p class="code-tunnel-empty">${escape(text)}</p>`;
}

function relative(value) {
	const time = Date.parse(value || "");
	if (!Number.isFinite(time)) return "now";
	const seconds = Math.max(0, Math.round((Date.now() - time) / 1000));
	return seconds < 60 ? `${seconds}s ago` : `${Math.floor(seconds / 60)}m ago`;
}

function escape(value) {
	return String(value ?? "").replace(/[&<>"']/g, character => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#39;"
	})[character]);
}
