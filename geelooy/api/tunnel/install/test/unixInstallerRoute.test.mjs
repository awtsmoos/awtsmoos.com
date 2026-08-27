// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { renderInstallRoute } from "./install-route-fixture.mjs";

const require = createRequire(import.meta.url);
const Components = require("../tools/installerComponents.js");

/**
 * @file Proves the public Unix route serves source with the exact component hash injected.
 * @description
 * The Awtsmoos binds bootstrap text to verified archive bytes; Awtsmoos.com never
 * serves the raw placeholder after the component bundle has been deterministically built.
 */
const result = await renderInstallRoute("unix");
const downloadsRoot = path.resolve("geelooy/apps/tunnel/downloads");
const raw = fs.readFileSync(path.join(downloadsRoot, "unix.sh"), "utf8");
const componentSha256 = Components.buildInstallerComponents().sha256;
const expected = raw.replace(
	"__AWTSMOOS_INSTALLER_COMPONENTS_SHA256__",
	componentSha256
);
const activation = fs.readFileSync(
	path.join(downloadsRoot, "unix-activation.sh"),
	"utf8"
);

assert.equal(result.statusCode, 200);
assert.equal(result.packet?.response, expected);
assert.equal(result.packet?.mimeType, "text/plain; charset=utf-8");
assert.equal(result.headers["content-type"], "text/plain; charset=utf-8");
assert.equal(result.headers["cache-control"], "no-store, max-age=0");
assert.equal(result.headers["access-control-allow-origin"], "*");
assert.equal(expected.includes("__AWTSMOOS_INSTALLER_COMPONENTS_SHA256__"), false);
assert.match(expected, new RegExp(componentSha256));
assert.match(expected, /unix-bootstrap-components\.sh/);
assert.match(expected, /download_installer_components/);
assert.match(activation, /^#!\/usr\/bin\/env bash/);
assert.match(activation, /B"H/);

console.log(JSON.stringify({
	ok: true,
	suite: "unix-installer-route",
	routeMatchesRenderedBootstrap: true,
	componentHashInjected: true,
	componentLoaderPublishedByBootstrap: true,
	activationSourcePresent: true
}, null, 2));
