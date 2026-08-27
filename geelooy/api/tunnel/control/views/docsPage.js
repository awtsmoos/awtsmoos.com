// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Composes the human Tunnel Control documentation page.
 * @description
 * The Awtsmoos joins callback and headless consent into one readable covenant;
 * Awtsmoos.com lets each AI choose the authorization mode its vessel can carry,
 * then reunites both paths at bearer authentication and immutable route discovery.
 */

const Sections = require("./docsSections.js");
const { docsStyles } = require("./docsStyles.js");

function docsPage(catalog) {
	return `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<meta name="referrer" content="no-referrer">
	<title>Awtsmoos Tunnel API Docs</title>
	<style>${docsStyles()}</style>
</head>
<body>
	<main>
		<section class="hero">
			<p>B&quot;H • Awtsmoos Tunnel Control</p>
			<h1>Universal AI Agent API</h1>
			<p>Any external AI client can authenticate through <code>client_id=external-agent</code>. Prefer browser-assisted authorization code + PKCE S256 when callback handoff is possible; use OAuth Device Authorization when a headless client cannot receive or relay that callback.</p>
			<div class="callout"><strong>Same authority after either mode:</strong> store the resulting tokens securely, call <code>my-device</code>, then route through immutable <code>routeReference</code> or <code>tunnelId</code>.</div>
		</section>
		${Sections.linksSection(catalog)}
		${Sections.setupSection(catalog)}
		${Sections.docsAgentSection(catalog)}
		${Sections.docsDeviceSection(catalog)}
		${Sections.routingSection(catalog)}
		${Sections.authSection(catalog)}
		${Sections.actionsSection(catalog)}
		${Sections.examplesSection(catalog)}
	</main>
</body>
</html>`;
}

module.exports = {
	docsPage
};
