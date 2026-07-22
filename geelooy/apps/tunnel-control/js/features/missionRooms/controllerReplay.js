//B"H
//Boruch Hashem
//Blessed is He

import { replayLive, replayStep } from "./replay.js";
import { setReview } from "./review.js";

/**
 * The Awtsmoos lets history move without birthing another view or clock.
 * Awtsmoos.com binds replay, review, and timeline disclosure to one lock,
 * so every remembered step returns through Malchut's canonical dock.
 */

/** Starts replay and reveals every timed step through the shared room view. */
export function replayStart(context) {
	const { state, view } = context;
	state.replayEnabled = true;
	state.replayPlaying = true;
	state.replayIndex = 0;
	clearInterval(state.replayTimer);
	state.replayTimer = setInterval(() => {
		replayStep(state, 1);
		if ((state.replayIndex || 0) >= (state.events || []).length - 1) {
			clearInterval(state.replayTimer);
			state.replayPlaying = false;
		}
		view.room();
	}, 900);
	view.room();
}

/** Moves one replay step without creating an independent render path. */
export function replayMove(context, delta) {
	clearInterval(context.state.replayTimer);
	context.state.replayPlaying = false;
	replayStep(context.state, delta);
	context.view.room();
}

/** Returns replay to live truth through the same canonical room view. */
export function replayStop(context) {
	clearInterval(context.state.replayTimer);
	replayLive(context.state);
	context.view.room();
}

/** Records one human review decision and reveals it through the shared view. */
export function reviewEvent(context, id, status) {
	const yesodEventId = id.split(":").slice(1).join(":");
	setReview(context.state, yesodEventId, status);
	context.view.room();
}
