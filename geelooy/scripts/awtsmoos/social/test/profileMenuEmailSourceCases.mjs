//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ProfileMenuEmailSourceCases
 * @description
 * The Awtsmoos lets mail intention divide into honest vessels without losing the path home;
 * Awtsmoos.com follows compose header, view, action, lifecycle, and style contracts wherever their responsibilities roam.
 */
import assert from "node:assert/strict";
import { read } from "./profileMenuTestSupport.mjs";

/**
 * @description Verifies the modular email source contracts used by the profile-menu simulation.
 * @returns {void}
 * @sideEffects Reads source files from the repository and throws assertion failures when contracts drift.
 */
export function runProfileEmailSourceCases() {
	const store = read("geelooy/email/store.js");
	const sidebar = read("geelooy/email/ui/sidebar.js");
	const controls = read("geelooy/email/ui/sidebarControls.js");
	const identitySummary = read("geelooy/email/ui/identitySummary.js");
	const modals = read("geelooy/email/ui/modals.js");
	const composeModal = read("geelooy/email/ui/composeModal.js");
	const composeView = read("geelooy/email/ui/composeModalView.js");
	const composeHeader = read("geelooy/email/ui/composeModalHeader.js");
	const sidebarCss = read("geelooy/email/css/sidebar.css");
	const composerCss = read("geelooy/email/css/composer.css");
	verifyStoreContract(store);
	verifySidebarContract(sidebar, controls, identitySummary);
	verifyModalContract(modals, composeModal, composeView, composeHeader);
	verifyStyleContract(sidebarCss, composerCss);
}

/**
 * @description Verifies mail-store compose routing and production logging constraints.
 * @param {string} source - Mail store source text.
 * @returns {void}
 * @sideEffects Throws assertion failures when source contracts drift.
 */
function verifyStoreContract(source) {
	assert.match(source, /params\.get\('to'\)/);
	assert.match(source, /openComposeTo\(ui, toAlias\)/);
	assert.match(source, /params\.get\('alias'\)/);
	assert.doesNotMatch(source, /console\.log/);
}

/**
 * @description Verifies sidebar identity wiring remains modular and free of inline style injection.
 * @param {string} sidebar - Sidebar source text.
 * @param {string} controls - Sidebar-control source text.
 * @param {string} identitySummary - Identity-summary source text.
 * @returns {void}
 * @sideEffects Throws assertion failures when source contracts drift.
 */
function verifySidebarContract(sidebar, controls, identitySummary) {
	assert.match(sidebar, /renderSidebarIdentity/);
	assert.match(controls, /mountMailIdentitySummary/);
	assert.match(identitySummary, /profileDropdown|identity/i);
	assert.doesNotMatch(sidebar, /document\.createElement\('style'\)/);
	assert.doesNotMatch(controls, /style\.textContent/);
}

/**
 * @description Verifies compose rendering, close control ownership, and transmission wiring across modular files.
 * @param {string} modals - Modal registry source text.
 * @param {string} composeModal - Compose controller source text.
 * @param {string} composeView - Compose body-view source text.
 * @param {string} composeHeader - Compose-header source text owning the close control.
 * @returns {void}
 * @sideEffects Throws assertion failures when source contracts drift.
 */
function verifyModalContract(modals, composeModal, composeView, composeHeader) {
	assert.match(modals, /mail-auth-gateway/);
	assert.match(modals, /identity-gateway-card/);
	assert.match(modals, /renderComposeModal/);
	assert.doesNotMatch(modals, /innerHTML =/);
	assert.match(composeView, /compose-body-input/);
	assert.match(composeHeader, /close-modal/);
	assert.match(composeHeader, /closeModal\(ui, 'composeModal'\)/);
	assert.match(composeModal, /sendMessageApi/);
	assert.match(composeModal, /classList: \['overlay', 'mail-compose-overlay', 'hidden'\]/);
}

/**
 * @description Verifies the email surface imports its system-level sidebar and composer style vessels.
 * @param {string} sidebarCss - Sidebar stylesheet source text.
 * @param {string} composerCss - Composer stylesheet source text.
 * @returns {void}
 * @sideEffects Throws assertion failures when stylesheet contracts drift.
 */
function verifyStyleContract(sidebarCss, composerCss) {
	assert.match(sidebarCss, /system\/sidebar-threads\.css/);
	assert.match(composerCss, /system\/composer-editor\.css/);
}
