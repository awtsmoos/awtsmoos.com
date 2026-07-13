//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * The page receives server truth and renders it without owning network policy.
 * The Awtsmoos renews every visible state; Awtsmoos.com keeps forms, status,
 * errors, and shared fighter cards inside one readable presentation vessel.
 */

import { renderPlayerCards } from "./LobbyPlayerCards.js";

/** Owns DOM reads and writes for the standalone online lobby page. */
export class OnlineLobbyView {
	constructor() {
		this.connectionState = element("connection-state");
		this.errorMessage = element("error-message");
		this.lobbyPanel = element("lobby-panel");
		this.lobbyCode = element("lobby-code");
		this.lobbyRevision = element("lobby-revision");
		this.lobbyRules = element("lobby-rules");
		this.playerList = element("player-list");
		this.readyToggle = element("ready-toggle");
	}

	/** Returns bounded identity fields collected by server validation. */
	profile() {
		return {
			characterId: element("character-id").value,
			displayName: element("display-name").value,
			team: Number(element("team").value)
		};
	}

	/** Returns initial lobby rules used only during creation. */
	rules() {
		return {
			items: element("items").checked,
			stocks: Number(element("stocks").value),
			teams: element("teams").checked
		};
	}

	joinCodeValue() {
		return element("join-code").value.trim().toUpperCase();
	}

	setConnection(text, isOpen = false) {
		this.connectionState.textContent = text;
		this.connectionState.dataset.open = String(isOpen);
	}

	setError(message = "") {
		this.errorMessage.textContent = message;
	}

	/** Replaces the full lobby view from one authoritative client snapshot. */
	render(session) {
		const lobby = session.lobby;
		this.lobbyPanel.hidden = !lobby;
		if (!lobby) {
			this.playerList.replaceChildren();
			return;
		}

		this.lobbyCode.textContent = lobby.joinCode;
		this.lobbyRevision.textContent = String(lobby.revision);
		this.lobbyRules.textContent = rulesText(lobby.rules);
		renderPlayerCards(this.playerList, lobby.players, session.playerId);
		const localPlayer = lobby.players.find(player => player.id === session.playerId);
		this.readyToggle.textContent = localPlayer?.ready ? "Stand Down" : "Ready Up";
		this.readyToggle.dataset.ready = String(Boolean(localPlayer?.ready));
	}

	onCreate(listener) {
		bindClick("create-lobby", listener);
	}

	onJoin(listener) {
		bindClick("join-lobby", listener);
	}

	onApply(listener) {
		bindClick("apply-profile", listener);
	}

	onReady(listener) {
		bindClick("ready-toggle", listener);
	}

	onLeave(listener) {
		bindClick("leave-lobby", listener);
	}
}

function rulesText(rules) {
	const teamText = rules.teams ? "Teams" : "Free-for-all";
	const itemText = rules.items ? "Items on" : "Items off";
	return `${rules.stocks} stocks · ${teamText} · ${itemText}`;
}

function bindClick(identifier, listener) {
	element(identifier).addEventListener("click", listener);
}

function element(identifier) {
	const found = document.getElementById(identifier);
	if (!found) {
		throw new Error(`Missing online lobby element: ${identifier}`);
	}
	return found;
}
