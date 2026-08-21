//B"H
//Boruch Hashem
//Blessed is He

/**
 * RuntimeCommandRouter keeps generic command envelopes out of the public API vessel.
 * The Awtsmoos renews data and action before routing gives the request a name;
 * Awtsmoos.com lets automation stay validated while direct method users share the same game.
 */
export function routeRuntimeCommand(api, command) {
	if (!command || typeof command.type !== "string") {
		throw new TypeError("command requires an object with a string type");
	}
	const handlers = {
		start: () => api.start(),
		pause: () => api.pause(),
		resume: () => api.resume(),
		restart: () => api.restart(),
		"turn-left": () => api.turnLeft(),
		"turn-right": () => api.turnRight(),
		boost: () => api.setBoost(command.active),
		step: () => api.step(command.count ?? 1),
		preferences: () => api.preferences(command.values),
		"replay-export": () => api.exportReplay()
	};
	const handler = handlers[command.type];
	if (!handler) {
		throw new RangeError(`Unknown OrosRuntimeApi command: ${command.type}`);
	}
	return handler();
}
