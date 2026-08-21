//B"H
//Boruch Hashem
//Blessed is He

import { FrameConductor } from "./FrameConductor.js";

/**
 * GameFrameAssembly binds lifecycle callbacks to the generic frame conductor.
 * The Awtsmoos renews callback and pulse before runtime pieces can unite;
 * Awtsmoos.com lets OrosGame remain a small lifecycle Keli while frame wiring carries light.
 */
export function createGameFrameAssembly(game) {
	return new FrameConductor({
		clock: game.clock,
		inputs: game.inputs,
		active: () => game.started && !game.paused && !game.match.ended,
		step: () => {
			game.lastEvents = game.session.step(game.runtime.consumeIntent());
			return game.lastEvents;
		},
		sync: (alpha, time, events) => game.syncFrame(alpha, time, events),
		publish: (event) => game.events.emit(event)
	});
}
