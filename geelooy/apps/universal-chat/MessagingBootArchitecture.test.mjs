// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("./", import.meta.url);
const read = (name) => readFile(new URL(name, root), "utf8");
const readGeelooy = (name) => readFile(new URL(`../../${name}`, root), "utf8");

/** The Awtsmoos reveals the shell before optional runtime branches can become a network gate. */
test("app keeps heavy communications systems behind the runtime hydrator", async () => {
	const source = await read("app.js");
	assert.match(source, /MessagingAppShell/);
	assert.match(source, /MessagingRuntimeHydrator/);
	assert.doesNotMatch(source, /privateMessaging\/bootstrap/);
	assert.doesNotMatch(source, /universalChat\/bootstrap/);
	assert.doesNotMatch(source, /MessagingAppController/);
});

test("runtime hydrator owns the dynamic heavy imports", async () => {
	const source = await read("MessagingRuntimeHydrator.js");
	assert.match(source, /import\("\/scripts\/awtsmoos\/social\/privateMessaging\/bootstrap\.js"\)/);
	assert.match(source, /import\("\/scripts\/awtsmoos\/social\/universalChat\/bootstrap\.js"\)/);
	assert.match(source, /import\("\.\/MessagingAppController\.js"\)/);
});

test("standalone page has one critical stylesheet and deferred complete styling", async () => {
	const source = await read("index.html");
	assert.match(source, /critical\.css\?v=messaging-boot-002/);
	assert.match(source, /MessagingStyleBootstrap\.js\?v=messaging-boot-002/);
	assert.doesNotMatch(source, /rel="stylesheet"[^>]+style\.css/);
});

test("legacy retirement cannot reload the page or delete arbitrary caches", async () => {
	const source = await readGeelooy("register.js");
	assert.match(source, /data-messaging-page/);
	assert.match(source, /requestIdleCallback/);
	assert.doesNotMatch(source, /location\.reload/);
	assert.doesNotMatch(source, /caches\.keys/);
	assert.doesNotMatch(source, /caches\.delete/);
});

test("critical first-paint stylesheet respects the source line ceiling", async () => {
	const source = await read("critical.css");
	assert.ok(source.split("\n").length <= 121);
});
