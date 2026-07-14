// B"H
// Boruch Hashem
// Blessed is He

import { profileFromState, positionFromState, samePosition } from './localProjection.js';
import { createOnlinePanel } from './onlinePanel.js';
import { createOnlineState, reduceOnlineState } from './onlineState.js';
import { REQUEST_TYPES, RESUME_KEY } from './protocol.js';
import { drawRemoteActors } from './remoteRenderer.js';
import { createSocketClient } from './socketClient.js';

/**
 * @file Joins local engine state to optional online presence without mixing authority.
 * @description The Awtsmoos renews private Chronicle and public gathering together.
 * Awtsmoos.com is remembered here as a broken network returns to offline play while
 * quests, battles, inventory, rewards, and saves remain entirely local and unharmed.
 */

export function createMultiplayerController(options = {}) {
	const client = options.client || createSocketClient(options);
	const storage = options.storage || globalThis.localStorage;
	const now = options.now || (() => Date.now());
	let online = createOnlineState();
	let latestLocal = null;
	let lastMove = null;
	let lastMoveAt = 0;
	let movementSequence = 0;
	let joinedMap = null;
	let started = false;
	let panel = null;

	function publish(message) {
		if (message.type === 'client.connecting') online = { ...online, connection: 'connecting' };
		else if (message.type === 'client.connected') online = { ...online, connection: 'connected' };
		else if (message.type === 'client.offline') online = { ...online, connection: 'offline' };
		else if (message.type === 'client.error') online = { ...online, connection: 'error' };
		else online = reduceOnlineState(online, message);
		if (online.resumeToken) storage?.setItem?.(RESUME_KEY, online.resumeToken);
		panel?.update(online);
	}

	function request(type, payload = {}) {
		return client.request(type, payload).catch((error) => {
			publish({ payload: { message: error.message }, type: 'error' });
			return null;
		});
	}

	async function joinLatestWorld() {
		const position = positionFromState(latestLocal);
		if (!position || online.connection !== 'online') return;
		const response = await request(REQUEST_TYPES.WORLD_JOIN, position);
		if (response) joinedMap = position.mapId;
	}

	async function beginSession() {
		const resumeToken = storage?.getItem?.(RESUME_KEY) || null;
		const type = resumeToken ? REQUEST_TYPES.SESSION_RESUME : REQUEST_TYPES.SESSION_JOIN;
		const response = await request(type, {
			...profileFromState(latestLocal),
			resumeToken
		});
		if (response) await joinLatestWorld();
	}

	client.onMessage((message) => {
		publish(message);
		if (message.type === 'client.connected') beginSession();
	});

	function updateLocalState(localState) {
		latestLocal = localState;
		if (!started) {
			started = true;
			client.connect();
		}
		const position = positionFromState(localState);
		if (!position || online.connection !== 'online') return;
		if (joinedMap !== position.mapId) {
			joinLatestWorld();
			return;
		}
		if (samePosition(lastMove, position) || now() - lastMoveAt < 140) return;
		lastMove = position;
		lastMoveAt = now();
		movementSequence += 1;
		request(REQUEST_TYPES.PLAYER_MOVE, { ...position, movementSequence });
	}

	const actions = {
		acceptInvite: (inviteId) => request(REQUEST_TYPES.PARTY_ACCEPT, { inviteId }),
		createParty: () => request(REQUEST_TYPES.PARTY_CREATE),
		invite: (targetId) => request(REQUEST_TYPES.PARTY_INVITE, { targetId }),
		leaveParty: () => request(REQUEST_TYPES.PARTY_LEAVE),
		sendChat: (message, channel) => request(REQUEST_TYPES.PLAYER_CHAT, { channel, message })
	};
	panel = options.panel || createOnlinePanel({ ...actions, document: options.document });
	panel.update(online);

	return {
		...actions,
		getState: () => online,
		render(ctx, renderState) {
			drawRemoteActors(ctx, renderState, online);
		},
		stop() {
			panel?.destroy?.();
			client.stop();
		},
		updateLocalState
	};
}
