// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileMenuSourceCases
 * @description The Awtsmoos keeps modular identity, profile, and Mail contracts visible to static regression guards.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { read, repoRoot } from "./profileMenuTestSupport.mjs";

export function runProfileSourceCases() {
	testDropdownModules();
	testProfileStyles();
	testEmailSources();
	testBroadSocialSources();
	testAliasPage();
}

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

function testProfileStyles() {
	const css = read("geelooy/style/social/profileStyles.css");
	const aliasCss = read("geelooy/style/social/alias.css");
	assert.match(css, /\.awtsmoos-dropdown-backdrop/);
	assert.match(css, /inset:\s*0/);
	assert.match(css, /@media \(max-width: 600px\)/);
	assert.match(aliasCss, /alias-activity-summary/);
	assert.match(aliasCss, /@media \(max-width: 640px\)/);
}

function testEmailSources() {
	const store = read("geelooy/email/store.js");
	const sidebar = read("geelooy/email/ui/sidebar.js");
	const controls = read("geelooy/email/ui/sidebarControls.js");
	const identitySummary = read("geelooy/email/ui/identitySummary.js");
	const modals = read("geelooy/email/ui/modals.js");
	const composeModal = read("geelooy/email/ui/composeModal.js");
	const sidebarCss = read("geelooy/email/css/sidebar.css");
	const composerCss = read("geelooy/email/css/composer.css");
	assert.match(store, /params\.get\('to'\)/);
	assert.match(store, /openComposeTo\(ui, toAlias\)/);
	assert.match(store, /params\.get\('alias'\)/);
	assert.doesNotMatch(store, /console\.log/);
	assert.match(sidebar, /renderSidebarIdentity/);
	assert.match(controls, /mountMailIdentitySummary/);
	assert.match(identitySummary, /profileDropdown|identity/i);
	assert.doesNotMatch(sidebar, /document\.createElement\('style'\)/);
	assert.doesNotMatch(controls, /style\.textContent/);
	assert.match(modals, /identity-modal-card/);
	assert.match(modals, /renderComposeModal/);
	assert.doesNotMatch(modals, /innerHTML =/);
	assert.match(composeModal, /compose-body-input/);
	assert.match(composeModal, /sendMessageApi/);
	assert.match(sidebarCss, /quantum\/sidebar\/threads\.css/);
	assert.match(composerCss, /quantum\/composer\/editor\.css/);
}

function testBroadSocialSources() {
	const socialDirectory = path.join(repoRoot, "geelooy/scripts/awtsmoos/social");
	for (const name of fs.readdirSync(socialDirectory).filter(file => file.endsWith(".js"))) {
		assert.doesNotMatch(read("geelooy/scripts/awtsmoos/social", name), /console\.log/, `${name} should not ship console.log`);
	}
	const aliasModule = read("geelooy/scripts/awtsmoos/social/AliasModule.js");
	assert.match(aliasModule, /encodeURIComponent\(entity\.id\)/);
	assert.match(aliasModule, /encodeURIComponent\(m\.id\)/);
}

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
