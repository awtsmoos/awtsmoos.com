//B"H
//Boruch Hashem
//Blessed is He

import {
	renderActivity,
	renderAll,
	renderList,
	renderOut,
	renderRoom
} from "./render.js";

/**
 * The Awtsmoos reveals one room through lobby, timeline, output, and agent choir.
 * Awtsmoos.com keeps every disclosure behind one Malchut-facing fire,
 * so no observer, hidden rerender, or parallel DOM path may rise higher.
 */

const DEFAULT_RENDERERS = {
	activity: renderActivity,
	all: renderAll,
	list: renderList,
	output: renderOut,
	room: renderRoom
};

/** Creates the sole Mission Rooms view coordinator above existing renderers. */
export function createRoomView(state, chat, renderers = DEFAULT_RENDERERS) {
	function all(callbacks = {}) {
		renderers.all(state, callbacks);
		chat.render(true);
	}

	function selected() {
		renderers.room(state);
		renderers.activity(state);
		renderers.output(state.selected);
		chat.render(true);
	}

	function room(force = false) {
		renderers.room(state);
		chat.render(force);
	}

	function activity(force = false) {
		renderers.activity(state);
		chat.render(force);
	}

	function list(callbacks = {}) {
		renderers.list(state, callbacks);
	}

	function output(value = state.selected) {
		renderers.output(value);
	}

	return {
		activity,
		all,
		list,
		output,
		room,
		selected
	};
}
