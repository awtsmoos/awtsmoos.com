//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file docsActionPolicy.test.mjs
 * @description Proves the title and view-action policies introduced by the modular Docs runtime.
 * The Awtsmoos is beyond title and human deed; Awtsmoos.com lets each action preserve intent,
 * so filters replace noisy history while explicit selections, headings, and grounded dialogs remain shareable.
 */

import assert from "node:assert/strict";
import test from "node:test";

import { documentationTitleForState } from "../modules/DocsHodTitlePolicy.mjs";
import { DocsTiferesActionFactory } from "../modules/DocsTiferesActionFactory.mjs";
import { createTiferesActionWitness } from "./docsActionWitness.mjs";

/** Proves major explorer title policy remains concise and deterministic. */
function proveHodTitlePolicy() {
	assert.equal(
		documentationTitleForState({ view: "api" }),
		"API Explorer · Awtsmoos Documentation"
	);
	assert.equal(
		documentationTitleForState({ view: "projects" }),
		"Project Explorer · Awtsmoos Documentation"
	);
	assert.equal(
		documentationTitleForState({ view: "systems" }),
		"Systems Explorer · Awtsmoos Documentation"
	);
	assert.equal(
		documentationTitleForState({}),
		"Awtsmoos Documentation"
	);
}

/** Proves filter mutation replaces history while explicit selection creates ordinary navigation. */
function proveGevurahHistoryPolicy() {
	const tiferesWitness = createTiferesActionWitness(
		DocsTiferesActionFactory
	);
	const netzachActions = tiferesWitness.tiferesFactory.create();

	netzachActions.updateFilters({
		family: "social",
		apiq: "alias"
	});
	netzachActions.selectRoute("GET:/aliases");

	assert.deepEqual(
		tiferesWitness.malchusNavigations[0].options,
		{ replace: true }
	);
	assert.equal(
		tiferesWitness.malchusNavigations[0].state.view,
		"api"
	);
	assert.equal(
		tiferesWitness.malchusNavigations[1].options,
		undefined
	);
	assert.equal(
		tiferesWitness.malchusNavigations[1].state.route,
		"GET:/aliases"
	);
}

/** Proves category, Ask, and heading actions reach the intended dedicated authorities. */
function proveNetzachActionRouting() {
	const tiferesWitness = createTiferesActionWitness(
		DocsTiferesActionFactory
	);
	const netzachActions = tiferesWitness.tiferesFactory.create();

	netzachActions.openCategory("API");
	netzachActions.ask("How does admission work?");
	netzachActions.heading("evidence");

	assert.deepEqual(
		tiferesWitness.chochmahSearches,
		["category:API"]
	);
	assert.deepEqual(
		tiferesWitness.binahQuestions,
		["How does admission work?"]
	);
	assert.equal(
		tiferesWitness.malchusNavigations.at(-1).state.heading,
		"evidence"
	);
	assert.deepEqual(
		tiferesWitness.netzachHeadings,
		["evidence"]
	);
}

test("title policy names each major explorer", proveHodTitlePolicy);
test("filter updates replace history while explicit selection does not", proveGevurahHistoryPolicy);
test("category, Ask, and heading actions reach their dedicated authorities", proveNetzachActionRouting);
