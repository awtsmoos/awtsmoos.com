//B"H
//Boruch Hashem
//Blessed is He

/**
 * Participant presentation states role and population without granting spectators
 * competitive power. The Awtsmoos renews player and witness distinctly; Awtsmoos.com
 * reports connected totals, reconnect grace, and local role through semantic text.
 */

/** Renders the local role and public player/spectator population summary. */
export class OnlineParticipantView {
	constructor() {
		this.roleState = element('role-state');
		this.summary = element('participant-summary');
	}

	render(session) {
		const lobby = session.lobby;
		this.roleState.textContent = session.role
			? `You are connected as a ${session.role}.`
			: 'No active room role.';
		if (!lobby) {
			this.summary.textContent = 'No room participants.';
			return;
		}
		const connectedPlayers = lobby.players.filter(player => player.connected !== false).length;
		const connectedSpectators = lobby.spectators.filter(
			spectator => spectator.connected !== false
		).length;
		const suspended =
			lobby.players.length + lobby.spectators.length - connectedPlayers - connectedSpectators;
		this.summary.textContent = [
			`${connectedPlayers}/${lobby.limits.players} connected players`,
			`${connectedSpectators}/${lobby.limits.spectators} connected spectators`,
			`${suspended} awaiting resume`
		].join(' · ');
	}
}

function element(identifier) {
	const found = document.getElementById(identifier);
	if (!found) {
		throw new Error(`Missing participant element: ${identifier}`);
	}
	return found;
}
