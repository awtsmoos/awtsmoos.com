//B"H
//Boruch Hashem
//Blessed is He

/**
 * The view receives public server truth and renders it without owning network policy.
 * The Awtsmoos renews every visible state; Awtsmoos.com reveals players, spectators,
 * connection grace, match actions, and replay readiness through safe DOM operations.
 */

import { renderPlayerCards, renderSpectatorCards } from './LobbyPlayerCards.js';
import { OnlineSetupForm } from './OnlineSetupForm.js';

/** Owns DOM reads and writes for the complete resilient online arena page. */
export class OnlineLobbyView {
	constructor() {
		this.form = new OnlineSetupForm();
		this.arenaPanel = element('arena-panel');
		this.connectionState = element('connection-state');
		this.errorMessage = element('error-message');
		this.lobbyPanel = element('lobby-panel');
		this.lobbyCode = element('lobby-code');
		this.lobbyPhase = element('lobby-phase');
		this.lobbyRules = element('lobby-rules');
		this.playerList = element('player-list');
		this.spectatorList = element('spectator-list');
		this.readyToggle = element('ready-toggle');
		this.rematchButton = element('rematch-match');
		this.replayButton = element('export-replay');
		this.startButton = element('start-match');
		this.applyButton = element('apply-profile');
	}

	profile() {
		return this.form.profile();
	}

	rules() {
		return this.form.rules();
	}

	joinCodeValue() {
		return this.form.joinCodeValue();
	}

	watchProfile() {
		return {
			displayName: this.form.displayName.value,
			joinCode: this.joinCodeValue()
		};
	}

	setConnection(text, isOpen = false) {
		this.connectionState.textContent = text;
		this.connectionState.dataset.open = String(isOpen);
	}

	setError(message = '') {
		this.errorMessage.textContent = message;
	}

	render(session) {
		const { lobby, match } = session;
		this.lobbyPanel.hidden = !lobby;
		this.arenaPanel.hidden = !match;
		if (!lobby) {
			this.playerList.replaceChildren();
			this.spectatorList.replaceChildren();
			return;
		}
		this.lobbyCode.textContent = lobby.joinCode;
		this.lobbyPhase.textContent = lobby.match?.phase || 'lobby';
		this.lobbyRules.textContent = rulesText(lobby.rules);
		renderPlayerCards(this.playerList, lobby.players, session.playerId);
		renderSpectatorCards(this.spectatorList, lobby.spectators || [], session.participantId);
		this.renderActions(session);
	}

	renderActions(session) {
		const { lobby, match, playerId, role } = session;
		const localPlayer = lobby.players.find(player => player.id === playerId);
		const isOwner = Boolean(localPlayer?.isOwner);
		const isPlayer = role === 'player';
		const inLobby = (lobby.match?.phase || 'lobby') === 'lobby';
		const allReady =
			lobby.players.length >= 2 &&
			lobby.players.every(player => player.ready && player.connected !== false);
		this.applyButton.hidden = !isPlayer || !inLobby;
		this.readyToggle.hidden = !isPlayer || !inLobby;
		this.readyToggle.textContent = localPlayer?.ready ? 'Stand Down' : 'Ready Up';
		this.startButton.hidden = !inLobby || !isOwner;
		this.startButton.disabled = !allReady;
		this.rematchButton.hidden = match?.phase !== 'finished' || !isOwner;
		this.replayButton.hidden = match?.phase !== 'finished';
	}

	on(identifier, listener) {
		element(identifier).addEventListener('click', listener);
	}
}

function rulesText(rules) {
	const teamText = rules.teams ? 'Teams' : 'Free-for-all';
	return `${rules.stocks} stocks · ${teamText} · ${rules.timerSeconds} seconds`;
}

function element(identifier) {
	const found = document.getElementById(identifier);
	if (!found) {
		throw new Error(`Missing online page element: ${identifier}`);
	}
	return found;
}
