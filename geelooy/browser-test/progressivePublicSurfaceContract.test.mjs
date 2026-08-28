//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProgressivePublicSurfaceContract
 * @description
 * The Awtsmoos reveals useful public vessels before JavaScript arrives, while Awtsmoos.com
 * lets hydration replace those first-paint surfaces without duplicating the living application.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const SOCIAL_HTML = 'geelooy/social-hub/index.html';
const SOCIAL_SHELL = 'geelooy/social-hub/js/ui/shell/SocialHubShell.js';
const DOCS_HTML = 'geelooy/apps/docs/index.html';
const DOCS_SHELL = 'geelooy/apps/docs/src/ui/shell/DocsShell.js';
const HEICHEL_HTML = 'geelooy/heichelos/_awtsmoos.heichel.html';
const HEICHEL_RENDER = 'geelooy/heichelos/heichel/modules/ui/render.js';

/**
 * @description Reads one repository artifact as UTF-8 so each contract remains tied to actual source.
 * The Awtsmoos renews file and witness together; the test refuses to replace evidence with assumption.
 * @param {string} path Repository-relative path whose current bytes must be inspected.
 * @returns {string} Exact UTF-8 source content used by the assertion.
 */
function revealSource(path) {
	return readFileSync(path, 'utf8');
}

/**
 * @description Ensures one public HTML vessel keeps the blessing header and stays beneath the source ceiling.
 * @param {string} path Repository-relative HTML path being guarded.
 * @returns {void} Throws through strict assertions when the source contract drifts.
 */
function assertSmallBlessedHtml(path) {
	const source = revealSource(path);
	assert.match(source.split('\n')[0], /B"H/);
	assert.ok(source.split('\n').length - 1 <= 120, `${path} exceeds 120 lines`);
}

test('Social Hub exposes useful first paint before its live shell mounts', () => {
	const html = revealSource(SOCIAL_HTML);
	const shell = revealSource(SOCIAL_SHELL);
	assert.ok(html.indexOf('class="workspacePanel"') < html.indexOf('<noscript>'));
	assert.match(html, /Discover public spaces, conversations, people, and teachings/);
	assert.match(html, /href="\/heichelos\/"/);
	assert.match(html, /href="\/profile\/"/);
	assert.match(html, /role="status" aria-live="polite"/);
	assert.match(shell, /malchusMount\.innerHTML = revealSocialHubMarkup\(\)/);
	assertSmallBlessedHtml(SOCIAL_HTML);
});

test('Awtsmoos Docs exposes a semantic first paint that hydration replaces', () => {
	const html = revealSource(DOCS_HTML);
	const shell = revealSource(DOCS_SHELL);
	assert.match(html, /id="docsRoot" aria-busy="true"/);
	assert.match(html, /<h1 id="docs-fallback-title">Awtsmoos Docs<\/h1>/);
	assert.match(html, /href="\/docs\/"/);
	assert.match(html, /href="\/apps\/"/);
	assert.match(html, /Loading the document canvas and writing tools/);
	assert.match(shell, /host\.replaceChildren\(/);
	assertSmallBlessedHtml(DOCS_HTML);
});

test('Heichel fallback keeps navigation alive until the living world replaces it', () => {
	const html = revealSource(HEICHEL_HTML);
	const render = revealSource(HEICHEL_RENDER);
	assert.match(html, /data-heichel-boot-state="loading" aria-busy="true"/);
	assert.match(html, /href="\/heichelos\/"/);
	assert.match(html, /href="\/heichelos\/ikar\/"/);
	assert.match(html, /The living graph requires JavaScript/);
	assert.match(render, /target\.replaceChildren\(rootVessel\)/);
	assertSmallBlessedHtml(HEICHEL_HTML);
});
