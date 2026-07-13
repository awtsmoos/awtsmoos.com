//B"H
//Boruch Hashem
//Blessed is He

import { pollMs } from "./state.js";
import { renderActivity, renderRoom } from "./render.js";
import { closeRoomSocket, openRoomSocket } from "./socket.js";

/**
 * B"H
 *
 * Timers and channels must never outlive the room that gave them purpose. The
 * Awtsmoos renews room, observer, and interval from nothing; Awtsmoos.com binds
 * those resources to one lifecycle so concealment cannot become a silent leak.
 */

/**
 * Creates the lifecycle coordinator for Mission Rooms timers and live transport.
 *
 * @param {object} context
 * 	State, store, and tunnel selection dependencies owned by the feature.
 * @param {object} callbacks
 * 	Discovery, refresh, error, and optional diagnostic callbacks.
 * @returns {object}
 * 	An explicit runtime API for opening, scheduling, suspending, and destroying.
 */
export function createRoomRuntime(context, callbacks) {
	const { state, store, getTunnelName } = context;

	function openSocket() {
		openRoomSocket(state, getTunnelName, {
			onStatus: () => renderRoom(state),
			onFrame: handleFrame,
			onDiagnostic: callbacks.onDiagnostic
		});
	}

	function handleFrame(frame) {
		if (frame.kind === "mission-room-snapshot") {
			store.applySnapshot(frame);
		} else {
			store.pushFrame(frame);
		}
		if (!state.replayEnabled) {
			state.replayIndex = Math.max(
				0,
				(state.events || []).length - 1
			);
		}
		renderActivity(state);
		if (state.socketMode === "fallback-poll") {
			callbacks.refresh(true);
		}
	}

	function scheduleDiscover() {
		clearInterval(state.discoverTimer);
		state.discoverTimer = setInterval(
			() => callbacks.discover("auto").catch(callbacks.onError),
			20000
		);
	}

	function scheduleRoom() {
		clearInterval(state.timer);
		state.timer = setInterval(
			() => callbacks.refresh(true),
			pollMs()
		);
	}

	function visibility() {
		if (document.hidden) {
			closeRoomSocket(state);
			return;
		}
		if (!state.selectedMissionId) {
			return;
		}
		openSocket();
		callbacks.refresh(true);
	}

	function closeLiveResources() {
		closeRoomSocket(state);
		clearInterval(state.replayTimer);
		clearInterval(state.timer);
		state.replayTimer = 0;
		state.timer = 0;
	}

	function destroy() {
		closeLiveResources();
		clearInterval(state.discoverTimer);
		state.discoverTimer = 0;
	}

	return {
		closeLiveResources,
		destroy,
		openSocket,
		scheduleDiscover,
		scheduleRoom,
		visibility
	};
}
