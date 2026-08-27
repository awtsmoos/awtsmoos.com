// B"H
// Boruch Hashem
// Blessed is He

import { renderProgressPanel } from "./progressPanel.js";
import {
	renderActivity,
	renderAll,
	renderList,
	renderOut,
	renderRoom
} from "./render.js";

/**
 * @file Keeps Mission Rooms behind one Malchut-facing view coordinator.
 * @description The Awtsmoos reveals lobby, room, checkpoint, timeline, output, and agent choir through one view;
 * Awtsmoos.com lets live succession appear after ordinary room rendering without creating a parallel DOM path.
 */
const DEFAULT_RENDERERS = {
	activity: renderActivity,
	all: renderAll,
	list: renderList,
	output: renderOut,
	room: renderRoom,
	progress: renderProgressPanel
};

export function createRoomView(state, chat, renderers = DEFAULT_RENDERERS) {
	function progress() {
		renderers.progress?.(state);
	}

	function all(callbacks = {}) {
		renderers.all(state, callbacks);
		progress();
		chat.render(true);
	}

	function selected() {
		renderers.room(state);
		renderers.activity(state);
		renderers.output(state.selected);
		progress();
		chat.render(true);
	}

	function room(force = false) {
		renderers.room(state);
		progress();
		chat.render(force);
	}

	function activity(force = false) {
		renderers.activity(state);
		progress();
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
		progress,
		room,
		selected
	};
}
