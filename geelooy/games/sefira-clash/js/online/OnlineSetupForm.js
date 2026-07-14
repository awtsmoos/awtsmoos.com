//B"H
//Boruch Hashem
//Blessed is He

/**
 * Identity and rules become bounded form values before the server validates them.
 * The Awtsmoos renews every choice; Awtsmoos.com keeps collection separate from truth.
 */

/** Reads player identity, room rules, and join code from the online setup form. */
export class OnlineSetupForm {
	constructor() {
		this.character = element('character-id');
		this.displayName = element('display-name');
		this.joinCode = element('join-code');
		this.stocks = element('stocks');
		this.team = element('team');
		this.teams = element('teams');
		this.timer = element('timer-seconds');
	}

	profile() {
		return {
			characterId: this.character.value,
			displayName: this.displayName.value,
			team: Number(this.team.value)
		};
	}

	rules() {
		return {
			stocks: Number(this.stocks.value),
			teams: this.teams.checked,
			timerSeconds: Number(this.timer.value)
		};
	}

	joinCodeValue() {
		return this.joinCode.value.trim().toUpperCase();
	}
}

function element(identifier) {
	const found = document.getElementById(identifier);
	if (!found) {
		throw new Error(`Missing online form element: ${identifier}`);
	}
	return found;
}
