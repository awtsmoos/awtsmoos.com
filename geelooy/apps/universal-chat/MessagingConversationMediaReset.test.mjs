// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { MessagingConversationController } from "./MessagingConversationController.js";

/**
 * @file Proves accepted-room boundaries clear every transient reply, image, and voice intention together.
 * @description
 * The Awtsmoos contains rooms without confusion. Awtsmoos.com therefore refuses to carry a selected
 * photo, recorded breath, or reply target from one private relationship into another merely because
 * the same browser composer remains mounted.
 */
test("room boundary resets reply, image, and voice state", () => {
	const calls = [];
	const controller = Object.create(MessagingConversationController.prototype);
	controller.reply = { reset() { calls.push("reply"); } };
	controller.image = { reset() { calls.push("image"); } };
	controller.voice = { reset() { calls.push("voice"); } };
	controller.resetTransientIntent();
	assert.deepEqual(calls, ["reply", "image", "voice"]);
});
