//B"H
//Boruch Hashem
//Blessed is He

/**
 * Cooperative page joins transport, room controls, bounded input, and authoritative
 * rendering. The Awtsmoos renews every teammate and tick; Awtsmoos.com keeps errors
 * visible, resumes private identity, and never predicts server-owned outcomes.
 */

import { CoopClient } from './CoopClient.js';
import { CoopInputController } from './CoopInputController.js';
import { CoopRenderer } from './CoopRenderer.js';
import { CoopView } from './CoopView.js';

const elements = collectElements();
const client = new CoopClient();
const input = new CoopInputController();
const renderer = new CoopRenderer(elements.canvas);
let inputTimer = null;
let lastMessage = '';

const view = new CoopView(elements, {
	create: profile => perform(() => client.create(profile), 'Cooperative room created.'),
	join: profile => perform(() => client.join(profile), 'Cooperative room joined.'),
	resume: () => perform(() => client.resume(), 'Cooperative identity resumed.'),
	ready: () => toggleReady(),
	start: () => perform(() => client.start(), 'Shared road started.'),
	rematch: () => perform(() => client.rematch(), 'Cooperative lobby restored.'),
	leave: () => perform(() => client.leave(), 'Cooperative room left.')
});

client.onState(room => {
	view.render(room, client.playerId, lastMessage);
	renderer.draw(room, client.playerId);
	updateInputLoop(room);
});

addEventListener('resize', () => {
	renderer.resize();
	renderer.draw(client.state, client.playerId);
});
addEventListener('beforeunload', () => {
	clearInterval(inputTimer);
	input.destroy();
	client.close();
});

globalThis.__sefiraCoopDebug = Object.freeze({
	state: () => structuredClone(client.state),
	playerId: () => client.playerId,
	resumeAvailable: () => Boolean(client.resumeToken)
});

view.render(null, null, 'Create, join, or resume a cooperative Expedition room.');
if (client.resumeToken) {
	perform(() => client.resume(), 'Previous cooperative identity resumed.');
}

async function perform(action, successMessage) {
	try {
		const result = await action();
		lastMessage = successMessage;
		view.render(client.state, client.playerId, lastMessage);
		return result;
	} catch (error) {
		lastMessage = `${error.code || 'ERROR'}: ${error.message}`;
		view.render(client.state, client.playerId, lastMessage);
		return null;
	}
}

async function toggleReady() {
	const local = client.state?.players.find(player => player.id === client.playerId);
	await perform(
		() => client.update({ ready: !local?.ready }),
		local?.ready ? 'Readiness withdrawn.' : 'Traveler ready.'
	);
}

function updateInputLoop(room) {
	const active = room?.phase === 'active';
	if (active && !inputTimer) {
		inputTimer = setInterval(() => client.sendInput(input.snapshot()), 50);
	}
	if (!active && inputTimer) {
		clearInterval(inputTimer);
		inputTimer = null;
	}
}

function collectElements() {
	const byId = id => document.getElementById(id);
	return {
		canvas: byId('coop-canvas'),
		setup: byId('coop-setup'),
		room: byId('coop-room'),
		status: byId('coop-status'),
		displayName: byId('display-name'),
		character: byId('character-id'),
		locationChoice: byId('location-id'),
		joinCodeInput: byId('join-code-input'),
		create: byId('create-room'),
		join: byId('join-room'),
		resume: byId('resume-room'),
		ready: byId('ready-player'),
		start: byId('start-room'),
		rematch: byId('rematch-room'),
		leave: byId('leave-room'),
		joinCode: byId('room-code'),
		location: byId('room-location'),
		phase: byId('room-phase'),
		players: byId('coop-players')
	};
}
