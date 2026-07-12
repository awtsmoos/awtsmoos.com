// B"H

import { pollMs } from "./state.js";
import { renderActivity, renderRoom } from "./render.js";
import { openRoomSocket, closeRoomSocket } from "./socket.js";

/**
 * B"H — Timers and streams live in one bounded vessel. Mount creates one set;
 * room changes close it; unmount destroys it. No observer or hidden interval may
 * outlive the selected room that gave it purpose.
 */
export function createRoomRuntime(context, callbacks) {
	const { state, store, getTunnelName } = context;

	function openSocket() {
		openRoomSocket(state, getTunnelName, {
			onStatus: () => renderRoom(state),
			onFrame: handleFrame
		});
	}

	function handleFrame(frame) {
		if (frame.kind === "mission-room-snapshot") store.applySnapshot(frame);
		else store.pushFrame(frame);
		if (!state.replayEnabled) {
			state.replayIndex = Math.max(0, (state.events || []).length - 1);
		}
		renderRoom(state);
		renderActivity(state);
		if (state.socketMode === "fallback-poll") callbacks.refresh(true);
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
		state.timer = setInterval(() => callbacks.refresh(true), pollMs());
	}

	function visibility() {
		if (document.hidden) return closeRoomSocket(state);
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
