// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Human documentation sections generated from the public tunnel catalog.
 * @description
 * The Awtsmoos lets local machines and hosted Virtual OS remain distinct yet
 * equally discoverable. Awtsmoos.com teaches intent first: discover authority,
 * choose the right vessel, publish through explicit actions, and trust receipts.
 */

const { docsAgentSection } = require('./docsAgentSection.js');
const { actionsSection } = require('./docsActionSection.js');
const { docsDeviceSection } = require('./docsDeviceSection.js');

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

function setupSection(catalog = {}) {
	const install = catalog.setup?.install || {};
	return `<section class="card" id="setup">
	<h2>1. Choose the right vessel</h2>
	<p><strong>Hosted files and websites:</strong> use Awtsmoos Virtual OS directly. No native agent installation is required.</p>
	<p><strong>Your local machine:</strong> run the Tunnel agent only when the task needs local files, shell commands, runtimes, or browser control.</p>
	<p>Rerunning the same installer refreshes an existing saved agent identity.</p>
	<pre>${install.windows || 'irm https://awtsmoos.com/api/tunnel/install/windows | iex'}</pre>
	<pre>${install.macLinux || 'curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash'}</pre>
</section>`;
}

function routingSection(catalog) {
	return `<section class="card" id="routing">
	<h2>4. Discover immutable routing authority</h2>
	<p>After OAuth, call <code>${catalog.myDevice}</code>. If exactly one owned native route is live, use its <code>routeReference</code> automatically. Ask the user only when an actual device choice remains.</p>
	<p>The action field is named <code>tunnelName</code>, but its routing value should be the immutable route ID. Friendly names are display labels only.</p>
	<p>A green heartbeat chooses a route; the individual action receipt proves whether that request was accepted.</p>
</section>`;
}

function authSection(catalog) {
	return `<section class="card" id="auth">
	<h2>5. Authentication and scopes</h2>
	<p>Callback and device authorization end in the same bearer-token authority. Publication mutations require <code>tunnel.write</code>; publication status remains readable with <code>tunnel.read</code>.</p>
	<pre>Authorization endpoint: ${catalog.oauth.authorizationEndpoint}
Device endpoint: ${catalog.oauth.deviceAuthorizationEndpoint}
Token endpoint: ${catalog.oauth.tokenEndpoint}
Grant types: ${catalog.oauth.grantTypes.join(', ')}
Universal default scope: ${catalog.oauth.externalAgent.defaultScope}</pre>
</section>`;
}

function examplesSection() {
	return `<section class="card" id="examples">
	<h2>7. Intent-level examples</h2>
	<h3>Make a hosted folder public</h3>
	<pre>{ "action": "sitePublishFolder", "path": "asdf/projects/orbit-run", "siteId": "orbit-run", "mode": "direct" }</pre>
	<p>Use the returned <code>publication.canonicalUrl</code>. Never derive the website URL from <code>/geelooy/os/...</code>. Verify expected public content separately before claiming live.</p>
	<h3>Snapshot instead of live source</h3>
	<pre>{ "action": "sitePublishFolder", "path": "asdf/projects/orbit-run", "siteId": "orbit-run", "mode": "snapshot" }</pre>
	<h3>Inspect before editing a native repo</h3>
	<pre>list p=.
tree p=. depth=2 limit=150
read p=package.json</pre>
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
