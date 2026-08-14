// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import {
	messagingNewActionPresentation,
	messagingNewActionStatus
} from "./MessagingNewActionPresentation.js";
import { MessagingSectionActions } from "./MessagingSectionActions.js";

/**
 * @file Proves every New doorway names the actual human request and routes it through a transactional consent sheet rather than implying unaccepted access already exists.
 * @description The Awtsmoos is one before chat, friendship, and group, while Awtsmoos.com tests the finite language and mutation handoff in light;
 * labels, modal promises, busy state, protocol kinds, and completion messages remain synchronized so one plus sign can never blur consent into convenience or erase retry context.
 */

const chat = messagingNewActionPresentation("chats");
assert.equal(chat.buttonLabel, "New chat");
assert.equal(chat.ariaLabel, "Request a private chat");
assert.match(chat.description, /until that person accepts/i);
assert.equal(chat.kind, "chat");

const friend = messagingNewActionPresentation("friends");
assert.equal(friend.buttonLabel, "Add friend");
assert.equal(friend.ariaLabel, "Send a friend request");
assert.match(friend.description, /does not automatically open a chat/i);
assert.equal(friend.kind, "friend");

const group = messagingNewActionPresentation("groups");
assert.equal(group.buttonLabel, "New group");
assert.match(group.description, /invite them and they accept/i);
assert.equal(messagingNewActionPresentation("requests"), null);
assert.equal(messagingNewActionPresentation("public"), null);

const modalCalls = [];
const networkCalls = [];
const statuses = [];
let modalValue = "Miriam";
const actions = new MessagingSectionActions({
	modal: {
		async perform(options, commit) {
			modalCalls.push(options);
			if (!modalValue) return null;
			await commit(modalValue);
			return modalValue;
		}
	},
	network: {
		request(alias, kind) {
			networkCalls.push({ alias, kind });
			return Promise.resolve();
		},
		createGroup(title) {
			networkCalls.push({ title, kind: "group" });
			return Promise.resolve();
		}
	},
	status(message) {
		statuses.push(message);
	}
});

assert.equal(await actions.create("chats"), true);
assert.equal(modalCalls.at(-1).title, "Request a private chat");
assert.equal(modalCalls.at(-1).label, "Alias to request");
assert.equal(modalCalls.at(-1).busyLabel, "Sending…");
assert.deepEqual(networkCalls.at(-1), { alias: "Miriam", kind: "chat" });
assert.match(statuses.at(-1), /opens after acceptance/i);

assert.equal(await actions.create("friends"), true);
assert.deepEqual(networkCalls.at(-1), { alias: "Miriam", kind: "friend" });
assert.match(statuses.at(-1), /still requires its own accepted request/i);

modalValue = "Learning Circle";
assert.equal(await actions.create("groups"), true);
assert.equal(modalCalls.at(-1).busyLabel, "Creating…");
assert.deepEqual(networkCalls.at(-1), { title: "Learning Circle", kind: "group" });
assert.match(statuses.at(-1), /each person chooses whether to join/i);

modalValue = "";
assert.equal(await actions.create("chats"), false);
assert.equal(await actions.create("requests"), false);
assert.match(messagingNewActionStatus("chats", "Leah"), /acceptance/i);
assert.match(messagingNewActionStatus("friends", "Leah"), /accepted request/i);

console.log("Messaging section-specific transactional New/consent language contract: PASS");
