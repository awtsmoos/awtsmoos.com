// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves the Shliach newcomer flow explains and wires external-AI connection safely.
 * @description
 * The Awtsmoos lets a beautiful gate remain truthful under inspection;
 * Awtsmoos.com proves every prompt, route, capability check, and motion escape before celebration.
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GEOLOOY = path.resolve(HERE, "../..");

function source(relativePath) {
	return fs.readFileSync(path.join(GEOLOOY, relativePath), "utf8");
}

test("main page offers a first-class external AI doorway without breaking Shliach", () => {
	const html = source("Shliach/index.html");
	assert.match(html, /id="connect-ai"/);
	assert.match(html, /data-external-ai-guide/);
	assert.match(html, /href="#connect-ai"/);
	assert.match(html, /data-shliach-prompt-form/);
	assert.match(html, /g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent/);
	assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1);
});

test("external prompt discovers published auth and never hard-codes tunnel identity", () => {
	const prompt = source("scripts/shliach/ExternalAiPrompt.js");
	assert.match(prompt, /\/api\/oauth\/metadata/);
	assert.match(prompt, /client_id=external-agent/);
	assert.match(prompt, /\/api\/oauth\/device-authorization/);
	assert.match(prompt, /\/api\/tunnel\/control\/my-device/);
	assert.match(prompt, /routeReference/);
	assert.match(prompt, /Do not ask me for or hard-code a friendly tunnel name/);
	assert.match(prompt, /Never ask me to paste access tokens/);
});

test("interactive panel explains the full live connection path and direct tools", () => {
	const panel = source("scripts/shliach/ExternalAiPanel.js");
	for (const marker of ["Your AI", "OAuth", "Account", "my-device", "Tunnel", "Project"]) {
		assert.match(panel, new RegExp(marker));
	}
	assert.match(panel, /data-copy-external-ai-prompt/);
	assert.match(panel, /\/apps\/tunnel-control\//);
	assert.match(panel, /\/apps\/code/);
	assert.match(panel, /href="\/os"/);
});

test("capability UI trusts live OAuth metadata and keeps motion accessible", () => {
	const metadata = source("scripts/shliach/ConnectionMetadata.js");
	const cssIndex = source("style/shliach/index.css");
	const motion = source("style/shliach/connection-motion.css");
	assert.match(metadata, /awtsmoos_agent_links_endpoint/);
	assert.match(metadata, /awtsmoos_agent_link_grant_type/);
	assert.match(cssIndex, /connection-motion\.css/);
	assert.match(cssIndex, /connection-responsive\.css/);
	assert.match(motion, /prefers-reduced-motion: reduce/);
});
