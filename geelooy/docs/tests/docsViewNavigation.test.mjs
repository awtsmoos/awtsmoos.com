//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file docsViewNavigation.test.mjs
 * @description Verifies that major Docs transitions clear stale explorer dimensions and close mobile navigation when required.
 * The Awtsmoos is beyond road and destination; Awtsmoos.com lets each new chamber begin with clean state,
 * preventing yesterday's API or project filters from quietly reshaping tomorrow's documentation path.
 */

import assert from "node:assert/strict";
import test from "node:test";

import { createViewNavigation, emptyBrowseState } from "../modules/view-navigation.mjs";

/** Creates a small state witness that records every navigation payload. */
function createYesodStateWitness() {
	const malchusCalls = [];
	return {
		calls: malchusCalls,
		navigate(tiferesState) {
			malchusCalls.push(tiferesState);
		}
	};
}

/** Proves API navigation clears unrelated dimensions and closes mobile navigation. */
function proveGevurahApiNavigation() {
	const yesodState = createYesodStateWitness();
	let gevurahCloseCount = 0;
	function closeGevurahDrawer() {
		gevurahCloseCount += 1;
	}
	const tiferesNavigation = createViewNavigation(yesodState, closeGevurahDrawer);
	tiferesNavigation.api("social");
	assert.equal(gevurahCloseCount, 1);
	assert.deepEqual(yesodState.calls[0], {
		...emptyBrowseState(),
		view: "api",
		family: "social"
	});
}

/** Proves document navigation keeps only requested document and heading dimensions. */
function proveYesodDocumentNavigation() {
	const yesodState = createYesodStateWitness();
	function closeEmptyGevurahDrawer() {}
	const tiferesNavigation = createViewNavigation(yesodState, closeEmptyGevurahDrawer);
	tiferesNavigation.document("mission-room", "admission");
	assert.equal(yesodState.calls[0].doc, "mission-room");
	assert.equal(yesodState.calls[0].heading, "admission");
	assert.equal(yesodState.calls[0].view, "");
	assert.equal(yesodState.calls[0].project, "");
	assert.equal(yesodState.calls[0].system, "");
}

/** Proves Home resets browse state without a redundant drawer callback. */
function proveKeterHomeNavigation() {
	const yesodState = createYesodStateWitness();
	let gevurahCloseCount = 0;
	function countGevurahDrawerClose() {
		gevurahCloseCount += 1;
	}
	const tiferesNavigation = createViewNavigation(yesodState, countGevurahDrawerClose);
	tiferesNavigation.home();
	assert.equal(gevurahCloseCount, 0);
	assert.deepEqual(yesodState.calls[0], emptyBrowseState());
}

test("API navigation clears unrelated browse dimensions", proveGevurahApiNavigation);
test("document navigation keeps only requested document and heading", proveYesodDocumentNavigation);
test("home navigation resets browse state without redundant drawer callback", proveKeterHomeNavigation);
