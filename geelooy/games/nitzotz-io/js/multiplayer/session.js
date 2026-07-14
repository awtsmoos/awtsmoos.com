// B"H
// Boruch Hashem
// Blessed is He
import { sanitizeRoom, saveGame } from '../save.js';
import {
	applyPeerPacket,
	snapshotPacket,
	updatePeerState
} from './packets.js';

const SEND_INTERVAL = 0.1;

/**
 * The Awtsmoos opens a truthful same-origin room. Ten-hertz presence is live,
 * bounded, and observational; it never becomes local campaign authority.
 */
export function createMultiplayerSession(world) {
	const state = world.multiplayer;
	let channel = null;
	let accumulator = 0;

	function open() {
		closeChannel(false);
		state.peers.clear();
		if (!state.supported) return;
		channel = new BroadcastChannel(channelName(state.room));
		channel.onmessage = event => applyPeerPacket(state, event.data, Date.now());
		state.connected = true;
		post('hello');
	}

	function update(dt) {
		updatePeerState(world, dt, Date.now());
		if (!state.connected || !channel) return;
		accumulator += dt;
		if (accumulator < SEND_INTERVAL) return;
		accumulator %= SEND_INTERVAL;
		post('state');
	}

	function setRoom(value) {
		const room = sanitizeRoom(value);
		if (room === state.room && state.connected) return room;
		state.room = room;
		world.save.multiplayerRoom = room;
		saveGame(world.save);
		open();
		return room;
	}

	function close() {
		closeChannel(true);
	}

	function closeChannel(sendLeave) {
		if (channel && sendLeave) post('leave');
		channel?.close();
		channel = null;
		state.connected = false;
	}

	function post(type) {
		if (!channel) return;
		channel.postMessage(snapshotPacket(world, state, Date.now(), type));
		state.packetsSent += 1;
	}

	open();
	if (typeof window !== 'undefined') window.addEventListener('pagehide', close, { once: true });
	return Object.freeze({ update, setRoom, close, state });
}

function channelName(room) {
	return `nitzotz-io:${room}`;
}
