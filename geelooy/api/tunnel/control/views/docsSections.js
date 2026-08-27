// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Human documentation sections generated from the public tunnel catalog.
 * @description
 * The Awtsmoos joins setup, callback OAuth, headless device consent, immutable
 * routing, and actions in one path; Awtsmoos.com keeps each concern in a small
 * vessel so future clients can learn the covenant without provider folklore.
 */

const { docsAgentSection } = require("./docsAgentSection.js");
const { docsDeviceSection } = require("./docsDeviceSection.js");
const { escapeHtml } = require("./docsEscape.js");

function linksSection(catalog) {
	const links = catalog.agentLinks;
	return `<nav>
	<a href="${links.tunnelControl}">Tunnel Control</a>
	<a href="${links.agentManifest}">Agent Manifest</a>
	<a href="${links.oauthMetadata}">OAuth Metadata</a>
	<a href="${links.deviceLogin}">Enter Device Code</a>
	<a href="${links.docsJson}">JSON Docs</a>
	<a href="${links.openapi}">OpenAPI</a>
	<a href="${links.bootstrap}">Bootstrap</a>
	<a href="${links.codeEditor}">Code Editor</a>
	<a href="${links.virtualOs}">Virtual OS</a>
</nav>`;
}

function setupSection() {
	return `<section class="card" id="setup">
	<h2>1. Connect the local machine</h2>
	<p>Run the installer. Running the same command again refreshes and starts an existing agent while preserving its saved identity.</p>
	<pre>irm https://awtsmoos.com/api/tunnel/install/windows | iex</pre>
	<pre>curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash</pre>
</section>`;
}

function routingSection(catalog) {
	return `<section class="card" id="routing">
	<h2>4. Discover the immutable tunnel route</h2>
	<p>Authenticate by either OAuth mode, then call <code>${catalog.myDevice}</code>. Use <code>routeReference</code> when present, otherwise <code>tunnelId</code>. The action schema field is named <code>tunnelName</code>, but its routing value should be that immutable ID.</p>
	<p>Friendly tunnel names are display labels only. Do not ask the user to paste one when <code>my-device</code> can discover the live route.</p>
</section>`;
}

function authSection(catalog) {
	return `<section class="card" id="auth">
	<h2>5. Authentication and scopes</h2>
	<p>Both callback and device authorization end in the same access/refresh token format. OAuth API calls use <code>Authorization: Bearer &lt;access_token&gt;</code>.</p>
	<pre>Authorization endpoint: ${catalog.oauth.authorizationEndpoint}
Device endpoint: ${catalog.oauth.deviceAuthorizationEndpoint}
Token endpoint: ${catalog.oauth.tokenEndpoint}
Grant types: ${catalog.oauth.grantTypes.join(", ")}
Universal default scope: ${catalog.oauth.externalAgent.defaultScope}</pre>
</section>`;
}

function actionCard(action) {
	return `<article class="action">
	<strong>${escapeHtml(action.action)}</strong><br>
	<span>${escapeHtml(action.scope)}</span>
	<p>${escapeHtml(action.summary || "")}</p>
	<code>${escapeHtml((action.params || []).join(", ") || "no params")}</code>
</article>`;
}

function actionsSection(catalog) {
	return `<section class="card" id="actions">
	<h2>6. Tunnel actions</h2>
	<div class="grid">${catalog.actions.map(actionCard).join("\n")}</div>
</section>`;
}

function examplesSection() {
	return `<section class="card" id="examples">
	<h2>7. First calls after discovery</h2>
	<pre>GET /api/tunnel/control/fs/{routeReference}?action=list&amp;p=.
GET /api/tunnel/control/fs/{routeReference}?action=tree&amp;p=.&amp;depth=2&amp;limit=150
GET /api/tunnel/control/fs/{routeReference}?action=read&amp;p=package.json
GET /api/tunnel/control/agent-manifest</pre>
</section>`;
}

module.exports = {
	actionsSection,
	authSection,
	docsAgentSection,
	docsDeviceSection,
	examplesSection,
	linksSection,
	routingSection,
	setupSection
};
