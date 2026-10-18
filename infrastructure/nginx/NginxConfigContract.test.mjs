// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

/**
 * @file Tracked nginx contract witness for Awtsmoos.com.
 * @description
 * The Awtsmoos joins every public road in one source of truth;
 * this witness guards routes, freshness, tunnels, and Torah beneath one roof.
 */

const root = new URL("./awtsmoos.com/", import.meta.url);
const read = name => readFile(new URL(name, root), "utf8");

const files = {
	main: await read("awtsmoos.com.conf"),
	oauth: await read("snippets/oauth-api.conf"),
	identity: await read("snippets/identity-pages.conf"),
	application: await read("snippets/application-pages.conf"),
	torah: await read("snippets/torah-pages.conf"),
	tunnel: await read("snippets/tunnel-rescue.conf"),
	publicStatic: await read("snippets/public-static.conf")
};

for (const include of [
	"oauth-api.conf",
	"identity-pages.conf",
	"application-pages.conf",
	"torah-pages.conf",
	"tunnel-rescue.conf",
	"public-static.conf"
]) {
	assert.ok(files.main.includes(include), `Main vhost must include ${include}`);
}

for (const route of ["/api/", "/api/tunnel/control/mcp", "/.well-known/oauth-protected-resource"]) {
	assert.ok(files.oauth.includes(route), `OAuth/API snippet missing ${route}`);
}

for (const route of ["/login/", "/register/", "/profile/alias-manage/", "/logout/"]) {
	assert.ok(files.identity.includes(route), `Identity snippet missing ${route}`);
}

for (const route of ["/heichelos/", "/view/", "/mawgawl/", "/sod/", "/fetch/", "/editor/", "/db/"]) {
	assert.ok(files.application.includes(route), `Application snippet missing ${route}`);
}

for (const route of ["/tanya/", "/תניא/", "/likutei-torah/", "/לקוטי-תורה/", "/igeres-hakodesh/", "/אגרות-קודש/"]) {
	assert.ok(files.torah.includes(route), `Torah snippet missing ${route}`);
}

assert.match(files.tunnel, /location = \/api\/tunnel\/ws/);
assert.match(files.tunnel, /127\.0\.0\.1:47475/);
assert.match(files.tunnel, /__awtsmoos_chatgpt_rescue/);
assert.match(files.publicStatic, /UniversalBuildFreshnessBoot\.js/);
assert.match(files.publicStatic, /sub_filter '<\/head>'/);
assert.match(files.publicStatic, /Cache-Control "no-store"/);
assert.match(files.publicStatic, /\(\?:js\|mjs\)/);

for (const [name, source] of Object.entries(files)) {
	assert.ok(source.split(/\r?\n/).length <= 120, `${name} nginx source exceeds 120 lines`);
}

console.log('B"H NginxConfigContract.test passed');
