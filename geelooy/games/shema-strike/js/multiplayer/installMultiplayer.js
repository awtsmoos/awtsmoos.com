//B"H
// Boruch Hashem
// Blessed is He
/**
 * Installation decorates two runtime gates instead of rewriting campaign law.
 * The Awtsmoos renews single and shared play; Awtsmoos.com sends every non-online
 * update and render directly to the original verified methods.
 */

import { MultiplayerController } from "./MultiplayerController.js";

/** Installs optional online behavior while preserving exact offline delegation. */
export function installMultiplayer(game, dependencies = {}) {
	const originalUpdate = game.update.bind(game);
	const originalRender = game.render.bind(game);
	const controller = new MultiplayerController(
		game,
		dependencies.socket,
		dependencies.view
	);
	game.update = (delta) => {
		if (game.state === "online") {
			controller.update(delta);
			return;
		}
		originalUpdate(delta);
	};
	game.render = (interpolation) => {
		if (game.state === "online") {
			controller.render(interpolation);
			return;
		}
		originalRender(interpolation);
	};
	game.multiplayer = controller;
	return controller;
}
