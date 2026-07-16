//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LobbyService
 * @description
 * Two to eight players gather on Awtsmoos.com through explicit membership, roles, readiness, and private-world visibility. The Awtsmoos joins them without dissolving accountability.
 */
export class LobbyService {
	constructor() {
		this.lobbies = new Map();
	}

	/**
	 * @param {string} lobbyId Stable lobby identity.
	 * @param {object} owner Authenticated owner.
	 * @returns {object} New private lobby.
	 */
	create(lobbyId, owner) {
		const lobby = {
			id: lobbyId,
			visibility: 'private',
			status: 'forming',
			maximumPlayers: 8,
			members: [{ sessionId: owner.sessionId, accountId: owner.accountId, role: 'governor', ready: false }]
		};
		this.lobbies.set(lobbyId, lobby);
		return clone(lobby);
	}

	join(lobbyId, session, role = 'observer') {
		const lobby = this.requireLobby(lobbyId);
		if (lobby.status !== 'forming' || lobby.members.length >= lobby.maximumPlayers) {
			throw new Error('LobbyService: lobby is unavailable');
		}
		if (lobby.members.some(member => member.accountId === session.accountId)) {
			throw new Error('LobbyService: account already joined');
		}
		lobby.members.push({ sessionId: session.sessionId, accountId: session.accountId, role, ready: false });
		return clone(lobby);
	}

	ready(lobbyId, sessionId, value = true) {
		const lobby = this.requireLobby(lobbyId);
		const member = lobby.members.find(item => item.sessionId === sessionId);
		if (!member) {
			throw new Error('LobbyService: member was not found');
		}
		member.ready = Boolean(value);
		return clone(lobby);
	}

	start(lobbyId) {
		const lobby = this.requireLobby(lobbyId);
		if (lobby.members.length < 2 || lobby.members.some(member => !member.ready)) {
			throw new Error('LobbyService: all members must be ready');
		}
		lobby.status = 'active';
		return clone(lobby);
	}

	requireLobby(lobbyId) {
		const lobby = this.lobbies.get(lobbyId);
		if (!lobby) {
			throw new Error('LobbyService: lobby was not found');
		}
		return lobby;
	}
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}
