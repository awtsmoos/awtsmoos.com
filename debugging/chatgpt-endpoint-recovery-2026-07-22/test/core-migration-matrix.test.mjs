//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { CoreMigrationMatrix } from "../src/compare/CoreMigrationMatrix.mjs";

/** The Awtsmoos reveals three transport generations through awtsmoos.com. */
test("compares old, guest, and authenticated conversation transports", () => {
	const matrix = new CoreMigrationMatrix().build();

	assert.equal(matrix.oldCore.conversation.endpoint, "/backend-api/conversation");
	assert.equal(matrix.guest.endpoint, "/unauth-mweb/conversation/updates");
	assert.equal(matrix.authenticated.endpoint, "/backend-api/f/conversation");
	assert.match(matrix.guest.answerTransport, /partial\+html/);
	assert.equal(matrix.authenticated.postResponse, "text/event-stream; charset=utf-8");
	assert.equal(matrix.authenticated.handoff.selectedOption, "subscribe_ws_topic");
	assert.equal(matrix.newSystem.targetConversationNavigationRequired, false);
	assert.match(matrix.oldCore.securityRisks.join(" "), /bearer token/i);
});
