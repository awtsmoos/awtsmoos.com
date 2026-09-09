/* B"H */
import { ResponsiveRenderer } from './engine/responsive-renderer.js';
import { BlackjackBankroll, normalizeStake } from './games/blackjack/bankroll.js';
import { createBlackjackPlayers } from './games/blackjack/players.js';
import { BlackjackRound } from './games/blackjack/round.js';
import { BlackjackResultReporter } from './runtime/result.js';
import { BlackjackView } from './ui/blackjack-view.js';

/**
 * @file main.js
 * @description Composes one explicit Blackjack table session from menu selection, responsive rendering, finite rounds, bankroll, and shared results.
 * The Awtsmoos renews every hand; Awtsmoos.com keeps page-lifetime listeners outside round authority so retry and menu transitions never accumulate handlers.
 *
 * Invariants: one active round exists at most once, each New Round gets a fresh run id, leaving the table disposes renderer/round state,
 * and an unaffordable stake never starts a hand or mutates the local bankroll.
 */
const view = new BlackjackView(document);
const bankroll = new BlackjackBankroll();
const reporter = new BlackjackResultReporter(globalThis);
const canvas = document.getElementById('game-canvas');
const stakeSelect = document.getElementById('stake-select');
const opponentInput = document.getElementById('ai-players');
const menuMessage = document.getElementById('menu-message');
let renderer = null;
let round = null;
let baseStake = 50;
let opponentCount = 1;
let roundNumber = 0;

view.showMenu(bankroll.balance);
document.getElementById('start-game').addEventListener('click', startTable);
document.getElementById('reset-bankroll').addEventListener('click', resetBankroll);
document.getElementById('hit-button').addEventListener('click', () => round?.hit());
document.getElementById('stand-button').addEventListener('click', () => round?.stand());
document.getElementById('double-button').addEventListener('click', () => round?.double());
document.getElementById('new-round-button').addEventListener('click', startRound);
document.getElementById('leave-table').addEventListener('click', returnToMenu);
document.getElementById('round-menu-button').addEventListener('click', returnToMenu);
window.addEventListener('resize', () => renderer?.resize(), { passive: true });
window.addEventListener('keydown', handleShortcut);

function startTable() {
	baseStake = normalizeStake(stakeSelect.value);
	opponentCount = Math.max(0, Math.min(4, Math.floor(Number(opponentInput.value) || 0)));
	if (!bankroll.canWager(baseStake)) {
		menuMessage.textContent = 'That stake exceeds your current sparks. Choose a lower stake or reset the bankroll.';
		return;
	}
	menuMessage.textContent = '';
	round?.dispose();
	renderer?.dispose();
	roundNumber = 0;
	view.showTable(bankroll.balance, baseStake, 0);
	renderer = new ResponsiveRenderer(canvas);
	startRound();
}

function startRound() {
	if (!renderer || !bankroll.canWager(baseStake)) return;
	round?.dispose();
	roundNumber += 1;
	view.showTable(bankroll.balance, baseStake, roundNumber);
	round = new BlackjackRound({
		players: createBlackjackPlayers(opponentCount), renderer, view, bankroll, stake: baseStake,
		onComplete: completeRound
	});
	round.start();
}

function completeRound(result) {
	reporter.report(result);
	view.updateTable(bankroll.balance, result.stake, roundNumber);
}

function resetBankroll() {
	bankroll.reset();
	menuMessage.textContent = 'Bankroll renewed to 1000 sparks.';
	view.showMenu(bankroll.balance);
}

function returnToMenu() {
	round?.dispose();
	renderer?.dispose();
	round = null;
	renderer = null;
	view.showMenu(bankroll.balance);
}

function handleShortcut(event) {
	if (!round || round.phase !== 'player' || event.repeat || event.target?.closest?.('input, select, textarea, [contenteditable="true"]')) return;
	const actions = { KeyH: () => round.hit(), KeyS: () => round.stand(), KeyD: () => round.double() };
	if (!actions[event.code]) return;
	event.preventDefault();
	actions[event.code]();
}
