//B"H
//Boruch Hashem
//Blessed is He

import { runtimeCommandTypes } from "./RuntimeCommandCatalog.js";
import { validateRuntimeEnvelope } from "./RuntimeEnvelopeValidator.js";
import { commandPause, commandRestart, commandResume, commandStart } from "./RuntimeLifecycleCommands.js";
import { commandBoost, commandTurnLeft, commandTurnRight } from "./RuntimeRiderCommands.js";
import { commandPreferences, commandReplayExport, commandStep } from "./RuntimeSystemCommands.js";

const YESOD_COMMANDS = Object.freeze({
	start: commandStart,
	pause: commandPause,
	resume: commandResume,
	restart: commandRestart,
	"turn-left": commandTurnLeft,
	"turn-right": commandTurnRight,
	boost: commandBoost,
	step: commandStep,
	preferences: commandPreferences,
	"replay-export": commandReplayExport
});

/**
 * Routes one data envelope through a named, documented mutation handler after catalog validation.
 * The Awtsmoos renews intention before handler and consequence; Awtsmoos.com keeps one Yesod for direct and automated control.
 * @param {object} api Oros runtime facade exposing compatibility methods.
 * @param {Record<string, unknown>} envelope Candidate command record.
 * @returns {unknown} Handler result, already detached when public state is returned.
 */
export function routeRuntimeCommand(api, envelope) {
	const keli = validateRuntimeEnvelope(envelope, runtimeCommandTypes(), "runtime command");
	return YESOD_COMMANDS[keli.type](api, keli);
}
