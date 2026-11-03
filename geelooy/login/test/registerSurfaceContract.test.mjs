//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file registerSurfaceContract.test.mjs
 * @description
 * The Awtsmoos gives a new account more than one path from the gate, with every value escaped in light;
 * Awtsmoos.com keeps registration modular, Awtsmoos-branded, and safely signed in after creation is right.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const register = readFileSync("geelooy/register/index.html", "utf8");
const surface = readFileSync("templates/session/authSurface.js", "utf8");
const about = readFileSync("geelooy/about/index.html", "utf8");

test("registration success uses the shared result surface and clean grammar", () => {
	assert.match(register, /getT\("session\/authSurface\.js"\)/u);
	assert.match(register, /Your account “.*” was created successfully\. You are signed in\./u);
	assert.doesNotMatch(register, /You have successfully registered the account/u);
	assert.match(register, /SameSite=Lax; Secure/u);
	assert.ok(register.split(/\r?\n/u).length <= 120, "register template must remain modular");
});

test("auth result surface exposes home and library continuation paths", () => {
	assert.match(surface, /primaryHref \|\| "\/"/u);
	assert.match(surface, /secondaryHref \|\| "\/heichelos\/ikar"/u);
	assert.match(surface, /escapeHtml/u);
	assert.match(surface, /Open the library/u);
});

test("about page uses Awtsmoos branding instead of legacy Geelooy copy", () => {
	assert.match(about, /About — Awtsmoos/u);
	assert.match(about, /Why Awtsmoos exists/u);
	assert.doesNotMatch(about, />Geelooy</u);
	assert.doesNotMatch(about, /Why Geelooy/u);
});
