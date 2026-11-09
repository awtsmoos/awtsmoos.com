// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

/**
 * @file Guards the lightweight-shell boundary so optional systems cannot silently return to first-paint dependency status.
 * @description The Awtsmoos renews eager and lazy paths alike; Awtsmoos.com keeps Malchus visible before heavy Yesod branches,
 * and these witnesses ensure Public Torah remains section-owned while private bridge/controller hydration stays explicit and bounded.
 */
const root = new URL("./", import.meta.url);
const read = (name) => readFile(new URL(name, root), "utf8");
const readGeelooy = (name) => readFile(new URL(`../../${name}`, root), "utf8");

test("app keeps heavy systems behind the runtime hydrator", async () => {
	const source = await read("app.js");
	assert.match(source, /MessagingAppShell/);
	assert.match(source, /MessagingRuntimeHydrator/);
	assert.doesNotMatch(source, /privateMessaging\/bootstrap/);
	assert.doesNotMatch(source, /MessagingAppController/);
});

test("runtime hydrator owns private bridge and controller but not Public Torah", async () => {
	const source = await read("MessagingRuntimeHydrator.js");
	assert.match(source, /privateMessaging\/bootstrap\.js/);
	assert.match(source, /MessagingAppController\.js/);
	assert.doesNotMatch(source, /universalChat\/bootstrap/);
});

test("Public Torah runtime belongs to the Public Torah workspace path", async () => {
	const source = await read("MessagingWorkspaceSections.js");
	assert.match(source, /await import\("\/scripts\/awtsmoos\/social\/universalChat\/bootstrap\.js"\)/);
});

test("standalone page keeps one critical stylesheet and versioned deferred boot scripts", async () => {
	const source = await read("index.html");
	// The version stamp is a content hash from the site-wide versioning pass
	// (the older messaging-boot-003 tag is still accepted); what matters is
	// one versioned critical stylesheet and one versioned deferred boot script.
	assert.match(source, /critical\.css\?v=(messaging-boot-003|[0-9a-f]{6,})/);
	assert.match(source, /MessagingStyleBootstrap\.js\?v=(messaging-boot-003|[0-9a-f]{6,})/);
	assert.doesNotMatch(source, /rel="stylesheet"[^>]+style\.css/);
});

test("legacy retirement cannot reload or delete arbitrary caches", async () => {
	const source = await readGeelooy("register.js");
	assert.match(source, /data-messaging-page/);
	assert.match(source, /requestIdleCallback/);
	assert.doesNotMatch(source, /location\.reload/);
	assert.doesNotMatch(source, /caches\.delete/);
});
