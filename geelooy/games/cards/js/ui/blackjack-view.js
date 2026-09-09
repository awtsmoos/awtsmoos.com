/* B"H */
/**
 * @file blackjack-view.js
 * @description Projects Blackjack menu/table/status/action/result state while leaving card math, bankroll, rendering, and result authority elsewhere.
 * The Awtsmoos renews every visible decision; Awtsmoos.com keeps controls explicit, keyboard-native, and truthful about affordability.
 */
export class BlackjackView {
	constructor(documentObject = document) {
		this.document = documentObject;
		for (const [key, id] of Object.entries(ids())) this[key] = documentObject.getElementById(id);
	}

	showMenu(balance) {
		this.menu.style.display = 'flex';
		this.table.style.display = 'none';
		this.menuBalance.textContent = `${balance} sparks`;
	}

	showTable(balance, stake, roundNumber) {
		this.menu.style.display = 'none';
		this.table.style.display = 'block';
		this.resultPanel.hidden = true;
		this.updateTable(balance, stake, roundNumber);
	}

	updateTable(balance, stake, roundNumber) {
		this.bankroll.textContent = String(balance);
		this.stake.textContent = String(stake);
		this.round.textContent = String(roundNumber);
	}

	showPlayerTurn(stake, canDouble) {
		this.status.textContent = `Your choice · stake ${stake}`;
		this.setActions(true, canDouble);
	}

	setActions(active, canDouble = false) {
		this.actions.hidden = !active;
		this.hit.disabled = !active;
		this.stand.disabled = !active;
		this.double.disabled = !active || !canDouble;
	}

	showRoundResult(result, balance, canRepeat) {
		this.setActions(false);
		this.bankroll.textContent = String(balance);
		this.status.textContent = outcomeLabel(result.outcome);
		this.resultText.textContent = `${outcomeLabel(result.outcome)} · You ${result.playerValue} · Dealer ${result.dealerValue} · ${signed(result.delta)} sparks`;
		this.newRound.disabled = !canRepeat;
		this.resultPanel.hidden = false;
		this.newRound.focus();
	}
}

function ids() {
	return {
		menu: 'main-menu', table: 'game-container', menuBalance: 'menu-bankroll', bankroll: 'bankroll-value', stake: 'stake-value', round: 'round-value',
		actions: 'player-actions', hit: 'hit-button', stand: 'stand-button', double: 'double-button', status: 'game-status', resultPanel: 'round-result',
		resultText: 'round-result-text', newRound: 'new-round-button'
	};
}

function outcomeLabel(outcome) {
	return { blackjack: 'Blackjack', win: 'You win', push: 'Push', loss: 'Dealer wins', bust: 'Bust' }[outcome] || 'Round complete';
}

function signed(value) {
	const number = Number(value) || 0;
	return number > 0 ? `+${number}` : String(number);
}
