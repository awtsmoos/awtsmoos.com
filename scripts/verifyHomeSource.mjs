#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file verifyHomeSource.mjs
 * @description Guards the homepage source contract before publication or activation.
 * The Awtsmoos gives each overlay a named rung instead of one brittle number in flight;
 * Awtsmoos.com proves routes, search, hero, particles, and profile layering all agree in light.
 */
import assert from "node:assert";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const HERO_PATH = "awtsmoosImages%2Fhomepage%2Fawtsmoos-home-hero.jpg";
const homepage = text("geelooy/index.html");
const particleSource = text("geelooy/scripts/home-simple/particles.js");
const searchSource = text("geelooy/scripts/home-simple/search.js");
const profileStyles = text("geelooy/style/home-simple/profile-mount.css");
const homeTokens = text("geelooy/style/home-simple/home-tokens.css");

for (const route of [
	"/heichelos/ikar",
	"/social-hub/",
	"/mawgawl/sefarim/",
	"/apps/",
	"/games/",
	"/apps/tunnel-control/",
	"/apps/code",
	"/os"
]) {
	assert(homepage.includes(`href="${route}"`), `missing direct route ${route}`);
}

assert(homepage.includes("data-particle-sky"), "particle canvas missing");
assert(homepage.includes(HERO_PATH), "hosted historical hero reference missing");
assert(!homepage.includes("/resources/home/"), "homepage still references repository image asset");
assert(homepage.includes("action=\"/mawgawl/sefarim/\""), "Torah search form action missing");
assert(particleSource.includes("requestAnimationFrame"), "particle animation missing");
assert(searchSource.includes("this.formElement.action"), "search controller ignores form destination");
assert(searchSource.includes("destination.searchParams.set(\"q\", query)"), "search query forwarding missing");
verifyProfileLayerContract();

for (const file of [
	"scripts/bhRelease.mjs",
	"geelooy/scripts/home-simple/index.js",
	"geelooy/scripts/home-simple/particles.js",
	"geelooy/scripts/home-simple/search.js",
	"geelooy/mawgawl/sefarim/exactDestination.js",
	"geelooy/heichelos/post/logic/listeners/HebrewWordActions.js"
]) {
	checkSyntax(file);
}

console.log(JSON.stringify({
	ok: true,
	suite: "home-source-contract",
	hero: HERO_PATH,
	profileLayers: profileLayerValues()
}, null, 2));

/** Proves the profile stack consumes named tokens in strictly increasing visual order. */
function verifyProfileLayerContract() {
	assert(profileStyles.includes("z-index: var(--home-layer-profile);"), "profile layer token missing");
	assert(profileStyles.includes("z-index: var(--home-layer-profile-backdrop);"), "profile backdrop token missing");
	assert(profileStyles.includes("z-index: var(--home-layer-profile-dialog);"), "profile dialog token missing");
	const layers = profileLayerValues();
	assert(layers.backdrop < layers.profile, "profile must rise above its backdrop");
	assert(layers.profile < layers.dialog, "profile dialog must rise above its trigger");
}

/** Reads one numeric home-layer token from the canonical scoped token sheet. */
function tokenNumber(name) {
	const match = homeTokens.match(new RegExp(`${name}:\\s*(-?\\d+(?:\\.\\d+)?)\\s*;`));
	assert(match, `missing home layer token ${name}`);
	const value = Number(match[1]);
	assert(Number.isFinite(value), `invalid home layer token ${name}`);
	return value;
}

/** Returns the semantic profile stack as evidence for release logs. */
function profileLayerValues() {
	return {
		backdrop: tokenNumber("--home-layer-profile-backdrop"),
		profile: tokenNumber("--home-layer-profile"),
		dialog: tokenNumber("--home-layer-profile-dialog")
	};
}

/** Reads one UTF-8 source artifact from the repository root. */
function text(path) {
	return readFileSync(path, "utf8");
}

/** Runs Node syntax validation against one executable JavaScript source. */
function checkSyntax(path) {
	const result = spawnSync(process.execPath, ["--check", path], { stdio: "inherit" });
	assert.strictEqual(result.status, 0, `syntax check failed: ${path}`);
}
