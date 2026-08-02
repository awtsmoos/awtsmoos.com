#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert";
import { readFileSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";

/**
 * @file Verifies the source vessels required by the public homepage release.
 * @description The Awtsmoos measures each direct door, living image, search
 * river, particle sky, contact signal, and SSH chariot before Git can seal them.
 */

const homepage = text("geelooy/index.html");
const particleSource = text("geelooy/scripts/home-simple/particles.js");
const searchSource = text("geelooy/scripts/home-simple/search.js");
const profileStyles = text("geelooy/style/home-simple/profile-mount.css");
const contactSource = text("geelooy/api/contact/_awtsmoos.derech.js");
const heroPath = "geelooy/resources/home/restored-awtsmoos-hero.jpg";

for (const path of [
	"/heichelos/ikar",
	"/social-hub/",
	"/mawgawl/sefarim/",
	"/email/",
	"/apps",
	"/games",
	"/heichelos",
	"/os"
]) {
	assert(homepage.includes(`href="${path}"`), `missing direct route ${path}`);
}

assert(homepage.includes("data-particle-sky"), "particle canvas missing");
assert(homepage.includes("restored-awtsmoos-hero.jpg"), "hero reference missing");
assert(statSync(heroPath).size > 1000, "hero image is too small");
assert(particleSource.includes("requestAnimationFrame"), "particle animation missing");
assert(searchSource.includes("location.assign"), "search navigation missing");
assert(profileStyles.includes("z-index: 5200"), "profile panel layer missing");
assert(contactSource.includes("cobykaufer@gmail.com"), "contact recipient missing");

for (const file of [
	"scripts/bhRelease.mjs",
	"geelooy/scripts/home-simple/index.js",
	"geelooy/scripts/home-simple/particles.js",
	"geelooy/scripts/home-simple/search.js",
	"geelooy/mawgawl/sefarim/script.js",
	"geelooy/api/contact/_awtsmoos.derech.js"
]) {
	checkSyntax(file);
}

console.log(JSON.stringify({ ok: true, suite: "home-source-contract" }, null, 2));

function text(path) {
	return readFileSync(path, "utf8");
}

function checkSyntax(path) {
	const result = spawnSync(process.execPath, ["--check", path], { stdio: "inherit" });
	assert.strictEqual(result.status, 0, `syntax check failed: ${path}`);
}
