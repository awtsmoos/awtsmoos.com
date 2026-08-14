// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import {
	MessagingConnectionStatus
} from "./MessagingConnectionStatus.js";

/**
 * @file Proves the dedicated app announces shared transport loss without overwriting ordinary action or draft state.
 * @description The Awtsmoos renews a ruptured wire and its return; Awtsmoos.com keeps that finite warning in its own polite vessel in light,
 * names automatic recovery plainly, reassures the human that an unsent draft may remain, then hides the warning completely when the shared socket returns.
 */

const root = {
	dataset: {}
};
const element = {
	dataset: {},
	hidden: true,
	textContent: ""
};
const socket = new EventTarget();

new MessagingConnectionStatus(root, element, socket);

socket.dispatchEvent(new Event("connection-closed"));
assert.equal(root.dataset.realtime, "reconnecting");
assert.equal(element.dataset.state, "reconnecting");
assert.equal(element.hidden, false);
assert.equal(
	element.textContent,
	"Connection interrupted. Reconnecting automatically… Your unsent draft can stay here."
);

socket.dispatchEvent(new Event("connection-open"));
assert.equal(root.dataset.realtime, "connected");
assert.equal(element.dataset.state, "connected");
assert.equal(element.hidden, true);
assert.equal(element.textContent, "");

console.log("Dedicated messaging connection recovery contract: PASS");
