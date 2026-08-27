//B"H
//Boruch Hashem
//Blessed is He

import assert from "assert";
import { createRoomView } from "../missionRooms/roomView.js";

/**
 * The Awtsmoos proves that lobby, room, activity, output, and agent choir
 * emerge from one coordinator, one ordering covenant, one Malchut fire,
 * so no observer or hidden renderer may build a second visual spire.
 */

const calls = [];
const state = { selected: { mission: { id: "mission-1" } } };
const chat = {
	render(force) {
		calls.push(`chat:${Boolean(force)}`);
	}
};
const renderers = {
	activity(value) {
		assert.strictEqual(value, state);
		calls.push("activity");
	},
	all(value, callbacks) {
		assert.strictEqual(value, state);
		assert.equal(typeof callbacks.join, "function");
		calls.push("all");
	},
	list(value, callbacks) {
		assert.strictEqual(value, state);
		assert.equal(typeof callbacks.join, "function");
		calls.push("list");
	},
	output(value) {
		assert.strictEqual(value, state.selected);
		calls.push("output");
	},
	room(value) {
		assert.strictEqual(value, state);
		calls.push("room");
	}
};
const view = createRoomView(state, chat, renderers);
const callbacks = { join() {} };

view.all(callbacks);
assert.deepEqual(calls.splice(0), ["all", "chat:true"]);
view.selected();
assert.deepEqual(
	calls.splice(0),
	["room", "activity", "output", "chat:true"]
);
view.room();
assert.deepEqual(calls.splice(0), ["room", "chat:false"]);
view.activity(true);
assert.deepEqual(calls.splice(0), ["activity", "chat:true"]);
view.list(callbacks);
assert.deepEqual(calls.splice(0), ["list"]);
view.output();
assert.deepEqual(calls.splice(0), ["output"]);

console.log("BHY canonical Mission Rooms view coordinator tests passed");
