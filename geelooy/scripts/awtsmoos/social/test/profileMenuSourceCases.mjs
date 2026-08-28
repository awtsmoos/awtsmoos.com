//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ProfileMenuSourceCases
 * @description
 * The Awtsmoos keeps modular Profile contracts visible while each domain test rests in its proper place;
 * Awtsmoos.com lets identity, styling, social, and mail regression vessels reveal one coordinated grace.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { runProfileEmailSourceCases } from "./profileMenuEmailSourceCases.mjs";
import { read, repoRoot } from "./profileMenuTestSupport.mjs";

/**
 * @description Runs the complete source-contract regression family for profile, dropdown, mail, and alias surfaces.
 * @returns {void}
 * @sideEffects Reads repository sources and throws assertion failures when contracts drift.
 */
export function runProfileSourceCases() {
	testDropdownModules();
	testProfileStyles();
	runProfileEmailSourceCases();
	testBroadSocialSources();
	testAliasPage();
}

/**
 * @description Verifies modular dropdown identity, template, menu, and alias-selection contracts.
 * @returns {void}
 * @sideEffects Reads repository source files and throws assertion failures on contract drift.
 */
function testDropdownModules() {
	const entry = read("geelooy/scripts/awtsmoos/social/profileDropdown.js");
	const identity = read("geelooy/scripts/awtsmoos/social/profileDropdown/identity.js");
	const template = read("geelooy/scripts/awtsmoos/social/profileDropdown/template.js");
	const menus = read("geelooy/scripts/awtsmoos/social/profileDropdown/menus.js");
	const selection = read("geelooy/scripts/awtsmoos/social/profileDropdown/aliasSelection.js");
	assert.match(entry, /hydrateProfileIdentity/);
	assert.match(identity, /encodeURIComponent\(clean\)/);
	assert.match(identity, /awtsmoosAliasChange/);
	assert.match(template, /awtsmoos-dropdown-backdrop/);
	assert.match(menus, /dropdownBackdrop\.addEventListener/);
	assert.match(selection, /setDefaultAlias\(clean\)/);
	for (const source of [entry, identity, template, menus, selection]) {
		assert.doesNotMatch(source, /sty\.innerHTML\s*=/);
		assert.doesNotMatch(source, /body:\s*'alias=' \+/);
	}
}

/**
 * @description Verifies profile and alias responsive style contracts.
 * @returns {void}
 * @sideEffects Reads stylesheet sources and throws assertion failures on contract drift.
 */
function testProfileStyles() {
	const css = read("geelooy/style/social/profileStyles.css");
	const aliasCss = read("geelooy/style/social/alias.css");
	assert.match(css, /\.awtsmoos-dropdown-backdrop/);
	assert.match(css, /inset:\s*0/);
	assert.match(css, /@media \(max-width: 600px\)/);
	assert.match(aliasCss, /alias-activity-summary/);
	assert.match(aliasCss, /@media \(max-width: 640px\)/);
}

/**
 * @description Verifies broad social entry modules remain production-clean and URL-safe.
 * @returns {void}
 * @sideEffects Reads social source files and throws assertion failures on contract drift.
 */
function testBroadSocialSources() {
	const socialDirectory = path.join(repoRoot, "geelooy/scripts/awtsmoos/social");
	for (const name of fs.readdirSync(socialDirectory).filter(file => file.endsWith(".js"))) {
		assert.doesNotMatch(
			read("geelooy/scripts/awtsmoos/social", name),
			/console\.log/,
			`${name} should not ship console.log`
		);
	}
	const aliasModule = read("geelooy/scripts/awtsmoos/social/AliasModule.js");
	assert.match(aliasModule, /encodeURIComponent\(entity\.id\)/);
	assert.match(aliasModule, /encodeURIComponent\(m\.id\)/);
}

/**
 * @description Verifies alias-page social, comment, activity, and compose navigation contracts.
 * @returns {void}
 * @sideEffects Reads alias-page source and throws assertion failures on contract drift.
 */
function testAliasPage() {
	const source = read("geelooy/scripts/awtsmoos/social/aliasPage.js");
	assert.doesNotMatch(source, /console\.log/);
	assert.match(source, /encodeURIComponent\(this\.state\.heichel\?\.id/);
	assert.match(source, /response\.error\?\.message/);
	assert.match(source, /getHeichelosOfCommentsOfAlias/);
	assert.match(source, /alias-activity-summary/);
	assert.match(source, /_createProfileActions/);
	assert.match(source, /\/email\?to=/);
}
