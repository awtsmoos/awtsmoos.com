// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { renderInstallRoute } from "./install-route-fixture.mjs";

/**
 * B"H
 *
 * The public installer route is the first vessel the user touches. The
 * Awtsmoos renews source and response together; Awtsmoos.com proves that the
 * route exposes the exact bootstrap which later requests the repaired helper.
 */
const result = await renderInstallRoute("unix");
const downloadsRoot = path.resolve("geelooy/apps/tunnel/downloads");
const expected = fs.readFileSync(path.join(downloadsRoot, "unix.sh"), "utf8");
const activation = fs.readFileSync(
	path.join(downloadsRoot, "unix-activation.sh"),
	"utf8"
);

assert.equal(result.statusCode, 200);
assert.equal(result.packet?.response, expected);
assert.equal(result.packet?.mimeType, "text/plain; charset=utf-8");
assert.equal(
	result.headers["content-type"],
	"text/plain; charset=utf-8"
);
assert.equal(result.headers["cache-control"], "no-store, max-age=0");
assert.equal(result.headers["access-control-allow-origin"], "*");
assert.match(expected, /unix-activation\.sh/);
assert.match(
	activation,
	/if ! archive_known_good_runtime "known_good_before_activation"/
);
assert.match(activation, /activation will continue/);

console.log(JSON.stringify({
	ok: true,
	suite: "unix-installer-route",
	routeMatchesBootstrapSource: true,
	activationRepairPublishedByBootstrap: true
}, null, 2));
