/* B"H */
import { BlackjackAI } from '../../engine/ai/blackjackAI.js';
import { blackjackHandValue, evaluateBlackjackOutcome, isNaturalBlackjack } from './hand.js';
import { BlackjackShoe } from './shoe.js';

/**
 * @file round.js
 * @description Owns one finite Blackjack hand from initial deal through human choice, AI/dealer resolution, bankroll settlement, and exactly-once result facts.
 * The Awtsmoos renews every judgment; Awtsmoos.com removes timer-driven rebirth so round authority ends explicitly before a new run begins.
 *
 * Invariants: one round completes once, Double requires the opening two-card state plus affordable doubled stake,
 * dealer reveal occurs only at resolution, and rendering never determines outcome or bankroll truth.
 */
let sequence = 0;

export class BlackjackRound {
	constructor(options) {
		Object.assign(this, options);
		this.shoe = new BlackjackShoe(4);
		this.runId = `blackjack:${Date.now()}:${++sequence}`;
		this.startedAt = performance.now();
		this.phase = 'idle';
		this.stake = options.stake;
		this.baseStake = options.stake;
		this.aiControllers = this.players.filter(player => player.isAI && !player.isDealer).map(player => new BlackjackAI(player));
	}

	get human() { return this.players.find(player => !player.isAI && !player.isDealer); }
	get dealer() { return this.players.find(player => player.isDealer); }

	start() {
		if (this.phase !== 'idle') return false;
		for (const player of this.players) player.hand = [];
		for (let pass = 0; pass < 2; pass += 1) for (const player of this.players) this.deal(player);
		this.phase = 'player';
		this.render(false);
		this.view.showPlayerTurn(this.stake, this.canDouble());
		if (isNaturalBlackjack(this.human.hand)) this.stand();
		return true;
	}

	hit() {
		if (this.phase !== 'player') return false;
		this.deal(this.human);
		this.render(false);
		if (blackjackHandValue(this.human.hand) > 21) this.finish();
		else this.view.showPlayerTurn(this.stake, false);
		return true;
	}

	stand() {
		if (this.phase !== 'player') return false;
		this.phase = 'resolving';
		this.view.setActions(false);
		this.runOpponents();
		while (blackjackHandValue(this.dealer.hand) < 17) this.deal(this.dealer);
		this.finish();
		return true;
	}

	double() {
		if (!this.canDouble()) return false;
		this.stake *= 2;
		this.deal(this.human);
		this.render(false);
		if (blackjackHandValue(this.human.hand) > 21) this.finish();
		else this.stand();
		return true;
	}

	canDouble() {
		return this.phase === 'player' && this.human.hand.length === 2 && this.bankroll.canWager(this.stake * 2);
	}

	runOpponents() {
		const upCard = this.dealer.hand[1];
		for (const controller of this.aiControllers) {
			while (blackjackHandValue(controller.player.hand) < 21 && controller.decideMove(this.shoe.trueCount(), upCard) === 'hit') this.deal(controller.player);
		}
	}

	deal(player) {
		const card = this.shoe.draw();
		if (card) player.hand.push(card);
		return card;
	}

	finish() {
		if (this.phase === 'complete' || this.phase === 'disposed') return false;
		const evaluation = evaluateBlackjackOutcome(this.human.hand, this.dealer.hand);
		const delta = this.bankroll.settle(evaluation.outcome, this.stake);
		this.phase = 'complete';
		this.render(true);
		const result = this.result(evaluation, delta);
		this.view.showRoundResult(result, this.bankroll.balance, this.bankroll.canWager(this.baseStake));
		this.onComplete?.(result);
		return true;
	}

	result(evaluation, delta) {
		const base = { blackjack: 300, win: 200, push: 100, loss: 0, bust: 0 }[evaluation.outcome] || 0;
		return { runId: this.runId, score: base + Math.min(21, evaluation.playerValue), elapsedMs: Math.max(0, Math.round(performance.now() - this.startedAt)), outcome: evaluation.outcome, completed: true, playerValue: evaluation.playerValue, dealerValue: evaluation.dealerValue, stake: this.stake, delta };
	}

	render(revealDealer) { this.renderer.drawGame(this.players, revealDealer); }
	dispose() { this.phase = 'disposed'; this.view.setActions(false); }
}
