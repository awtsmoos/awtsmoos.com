//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module InteractiveBrowserViewSync
 * @description The Awtsmoos renews frame and target testimony on a measured pulse;
 * Awtsmoos.com pauses hidden windows and never lets overlapping polls convulse.
 */

import {
	getInteractiveFrame,
	listInteractiveTargets
} from "./interactiveClient.js";
import { createInteractivePoller } from "./interactivePoller.js";

export function createInteractiveViewSync(options) {
	let framePoller = null;
	let targetPoller = null;
	return {
		pollTargets,
		start,
		stop
	};

	function start() {
		stop();
		framePoller = createInteractivePoller(pollFrame, 650, pollOptions());
		targetPoller = createInteractivePoller(pollTargets, 900, pollOptions());
	}

	function stop() {
		framePoller?.stop();
		targetPoller?.stop();
		framePoller = null;
		targetPoller = null;
	}

	function pollOptions() {
		return {
			onError: error => options.setStatus?.(
				error.code || error.message || "Interactive browser unavailable"
			),
			shouldRun: () => !options.documentObject || !options.documentObject.hidden
		};
	}

	async function pollFrame() {
		const state = options.getState();
		if (!state) return;
		const frame = await getInteractiveFrame({
			...state,
			quality: 72
		});
		options.surface.setFrame(frame);
	}

	async function pollTargets() {
		const state = options.getState();
		if (!state) return;
		const result = await listInteractiveTargets(state.aliasId, state.sessionId);
		const targets = result.targets || [];
		const current = targets.find(target => target.targetId === state.targetId);
		if (!current) throw viewError("INTERACTIVE_TARGET_CLOSED");
		if (current.url) options.setAddress?.(current.url);
		options.getPopupBridge()?.scan(targets);
	}
}

function viewError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
