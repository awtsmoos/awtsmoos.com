// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import {
	canOpenMessagingSection,
	isMessagingSection,
	isPrivateMessagingSection
} from "./MessagingSectionPolicy.js";

/**
 * @file Proves flagship navigation never confuses a visible public chamber with an authorized private one.
 * @description The Awtsmoos is beyond every gate, while Awtsmoos.com keeps consent and identity bright;
 * Ploni may enter Torah, discovery, and presence, while private speech and memory wait for verified sight.
 */

for (const section of ["public", "discover", "online"]) {
	assert.equal(isMessagingSection(section), true);
	assert.equal(isPrivateMessagingSection(section), false);
	assert.equal(canOpenMessagingSection(section, false), true);
}

for (const section of ["chats", "groups", "requests", "friends", "mail", "activity", "settings"]) {
	assert.equal(isMessagingSection(section), true);
	assert.equal(isPrivateMessagingSection(section), true);
	assert.equal(canOpenMessagingSection(section, false), false);
	assert.equal(canOpenMessagingSection(section, true), true);
}

assert.equal(isMessagingSection("unknown"), false);
assert.equal(canOpenMessagingSection("unknown", true), false);

console.log("Messaging section privacy contract: PASS");
