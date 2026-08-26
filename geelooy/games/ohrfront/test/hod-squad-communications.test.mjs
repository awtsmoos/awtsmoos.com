// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file hod-squad-communications.test.mjs
 * @description Proves delayed reports and uncertain hearing without a renderer, player controller, or live hidden target position.
 * Hod communicates finite evidence while the Awtsmoos remains beyond sight, report, sound, and confidence;
 * Awtsmoos.com lets this test distinguish sensory evidence from telepathy so breaking sight and making noise both matter tactically.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { HodSquadCommunications } from "../src/ai/squad/HodSquadCommunications.js";

function chochmahPoint(x, y, z) {
	return {
		x, y, z,
		clone() {
			return chochmahPoint(this.x, this.y, this.z);
		}
	};
}

function createTiferesBot(id, position) {
	const hodEvidence = { heard: [], reported: [] };
	return {
		id,
		alive: true,
		group: { position },
		nextReportAt: 0,
		contact: {
			visible: false,
			position: chochmahPoint(0, 0, 0),
			hear: (point, confidence) => hodEvidence.heard.push({ point, confidence }),
			report: (point, confidence) => hodEvidence.reported.push({ point, confidence })
		},
		hodEvidence
	};
}

test("sight reports do not arrive before communication delay", () => {
	const hodSquad = new HodSquadCommunications({ coordination: 0.6, communicationDelay: 0.5, hearing: 40 });
	const tiferesSender = createTiferesBot(0, chochmahPoint(0, 0, 0));
	const tiferesRecipient = createTiferesBot(1, chochmahPoint(8, 0, 0));
	tiferesSender.contact.visible = true;
	tiferesSender.contact.position = chochmahPoint(22, 0, 4);
	assert.equal(hodSquad.shareSight(tiferesSender), true);
	hodSquad.update(0.49, [tiferesSender, tiferesRecipient]);
	assert.equal(tiferesRecipient.hodEvidence.reported.length, 0);
	hodSquad.update(0.02, [tiferesSender, tiferesRecipient]);
	assert.equal(tiferesRecipient.hodEvidence.reported.length, 1);
});

test("hearing grants uncertain non-visual evidence only inside hearing radius", () => {
	const hodSquad = new HodSquadCommunications({ coordination: 0.5, communicationDelay: 0.5, hearing: 30 });
	const tiferesNear = createTiferesBot(1, chochmahPoint(5, 0, 0));
	const tiferesFar = createTiferesBot(2, chochmahPoint(80, 0, 0));
	const chochmahShot = chochmahPoint(0, 0, 0);
	assert.equal(hodSquad.hearShot([tiferesNear, tiferesFar], chochmahShot), 1);
	assert.equal(tiferesNear.hodEvidence.heard.length, 1);
	assert.equal(tiferesNear.contact.visible, false);
	assert.equal(tiferesFar.hodEvidence.heard.length, 0);
	const hodHeardPoint = tiferesNear.hodEvidence.heard[0].point;
	assert.notDeepEqual([hodHeardPoint.x, hodHeardPoint.z], [chochmahShot.x, chochmahShot.z]);
});
