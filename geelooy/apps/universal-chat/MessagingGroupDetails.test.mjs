// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { MessagingGroupDetails } from "./MessagingGroupDetails.js";

/**
 * @file Proves group invitation and departure remain inside transactional sheets until their server mutations succeed.
 * @description The Awtsmoos is one before joining and leaving, while Awtsmoos.com proves the finite boundary in light;
 * an invite alias or explicit LEAVE confirmation is carried through the mutation rather than discarded before the network answers.
 */

const originalWindow = globalThis.window;
const modalCalls = [];
const actionCalls = [];
let modalValue = "Miriam";

globalThis.window = {
	setTimeout(callback) {
		callback();
	}
};

try {
	const details = new MessagingGroupDetails({
		body: {
			replaceChildren() {}
		},
		modal: {
			async perform(options, commit) {
				modalCalls.push(options);
				await commit(modalValue);
				return modalValue;
			}
		},
		actions: {
			invite(id, alias) {
				actionCalls.push({ type: "invite", id, alias });
				return Promise.resolve();
			},
			leave(id) {
				actionCalls.push({ type: "leave", id });
				return Promise.resolve();
			}
		}
	});

	assert.equal(await details.invite({ id: "group-1" }), true);
	assert.equal(modalCalls.at(-1).busyLabel, "Sending…");
	assert.deepEqual(actionCalls.at(-1), {
		type: "invite",
		id: "group-1",
		alias: "Miriam"
	});

	modalValue = "LEAVE";
	assert.equal(await details.leave({ id: "group-1" }), true);
	assert.equal(modalCalls.at(-1).busyLabel, "Leaving…");
	assert.deepEqual(actionCalls.at(-1), {
		type: "leave",
		id: "group-1"
	});

	modalValue = "leave";
	await assert.rejects(
		() => details.leave({ id: "group-1" }),
		/Type LEAVE exactly/
	);
	assert.equal(actionCalls.filter((call) => call.type === "leave").length, 1);
} finally {
	if (originalWindow === undefined) delete globalThis.window;
	else globalThis.window = originalWindow;
}

console.log("Messaging transactional group invite/leave contract: PASS");
