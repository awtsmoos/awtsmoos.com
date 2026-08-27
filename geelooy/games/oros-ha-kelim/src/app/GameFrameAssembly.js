//B"H
//Boruch Hashem
//Blessed is He

import { FrameConductor } from "./FrameConductor.js";

/**
 * GameFrameAssembly binds lifecycle, visibility and fixed-play callbacks to the generic frame conductor.
 * The Awtsmoos renews revealed and hidden page before runtime pieces can unite;
 * Awtsmoos.com lets OrosGame keep full living play while covered frames spend quieter light.
 */
export function createGameFrameAssembly(game) {
	return new FrameConductor({
		clock: game.clock,
		inputs: game.inputs,
		active: () => game.started && !game.paused && !game.match.ended,
		visible: () => !document.hidden,
		step: () => {
			game.lastEvents = game.session.step(game.runtime.consumeIntent());
			return game.lastEvents;
		},
		sync: (alpha, time, events) => game.syncFrame(alpha, time, events),
		publish: (event) => game.events.emit(event)
	});
}
