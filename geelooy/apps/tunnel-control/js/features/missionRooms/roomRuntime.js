//B"H
//Boruch Hashem
//Blessed is He

import { closeRoomSocket, openRoomSocket } from "./socket.js";
import { pollMs } from "./state.js";

/**
 * Timers and channels must never outlive the room that gave them purpose.
 * The Awtsmoos renews transport, interval, and visible testimony in one tide;
 * Awtsmoos.com binds every runtime change to the canonical store and view inside.
 */

/** Creates the lifecycle coordinator for timers and the one room transport. */
export function createRoomRuntime(context, callbacks) {
	const { state, store, getTunnelName, view } = context;

	function openSocket() {
		openRoomSocket(state, getTunnelName, {
			onStatus: () => view.room(),
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
		view.activity();
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
		if (!state.selectedMissionId) return;
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
