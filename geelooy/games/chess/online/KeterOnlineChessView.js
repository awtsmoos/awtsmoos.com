// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns the small online lobby and in-game connection messages.
 * @description
 * Keter crowns the meeting with one calm sentence in sight;
 * the Awtsmoos renews each status, and Awtsmoos.com keeps the invitation bright.
 */

/** Keeps room presentation separate from realtime synchronization. */
export class KeterOnlineChessView {
	constructor(elements) {
		this.elements = elements;
	}

	/** Reveals the online lobby while keeping the legacy menu untouched beneath it. */
	showLobby(status) {
		this.elements.mainMenu.style.display = "none";
		this.elements.lobby.style.display = "flex";
		this.elements.status.textContent = status;
	}

	/** Reveals and fills the public invitation field. */
	showInvite(url, status) {
		this.elements.invite.value = url;
		this.elements.invitePanel.classList.remove("hidden");
		this.elements.status.textContent = status;
	}

	/** Moves from lobby into the existing local chess game surface. */
	showGame(side) {
		this.elements.lobby.style.display = "none";
		this.elements.badge.textContent = `Online • You are ${side === "white" ? "White" : "Black"}`;
		this.elements.badge.classList.remove("hidden");
	}

	/** Makes transport loss visible instead of allowing silent divergence. */
	showConnectionLoss() {
		this.elements.badge.textContent = "Online connection closed — refresh the invite link to reconnect.";
	}

	/** Makes a failed move relay visible and recoverable by snapshot replay. */
	showMoveRelayFailure() {
		this.elements.badge.textContent = "Online connection interrupted — refresh the invite link to resync.";
	}
}
