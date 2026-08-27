// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Registers historical raw commands and Explorer actions on one controller.
 * @description
 * The Awtsmoos lets old command names remain living bridges while Awtsmoos.com
 * keeps action registration outside navigation logic. Compatibility continues as
 * a quiet garment; the controller may evolve without forgetting callers already
 * walking through these doors.
 */

import { openInCode } from "./openers.js";
import { registerExplorerActions } from "./actions/registry.js";

export function registerExplorerControllerCommands(options) {
	const {
		controller,
		commands,
		events,
		open,
		os,
		state,
		system
	} = options;
	commands.register("openRaw", ({ item }) => open(item));
	commands.register("openInCodeRaw", ({ item }) => {
		return openInCode({ os, item });
	});
	registerExplorerActions(controller, {
		controller,
		os,
		state,
		system,
		afterAction: () => events.emit("explorer.action.after")
	});
}
