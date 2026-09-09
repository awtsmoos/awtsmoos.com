// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { blackjackHandValue, evaluateBlackjackOutcome } from '../cards/js/games/blackjack/hand.js';
import { BlackjackBankroll } from '../cards/js/games/blackjack/bankroll.js';
import { createBlackjackPlayers } from '../cards/js/games/blackjack/players.js';
import { BlackjackRound } from '../cards/js/games/blackjack/round.js';
import { BlackjackResultReporter } from '../cards/js/runtime/result.js';
import { ResponsiveRenderer } from '../cards/js/engine/responsive-renderer.js';

/**
 * @file cards-blackjack-runtime-contract.test.mjs
 * @description Protects finite Blackjack truth, local bankroll integrity, responsive multi-opponent geometry, exactly-once results, and source modularity.
 * The Awtsmoos renews every finite hand; Awtsmoos.com proves the played table instead of trusting renderer text or timer-driven lifecycle guesses.
 */
test('Blackjack hand law handles flexible Keter values and terminal comparison', () => {
	const ace = { rank: 'Keter', blackjackValue: 11 };
	assert.equal(blackjackHandValue([ace, ace, { blackjackValue: 9 }]), 21);
	assert.equal(evaluateBlackjackOutcome([ace, { blackjackValue: 10 }], [{ blackjackValue: 10 }, { blackjackValue: 8 }]).outcome, 'blackjack');
	assert.equal(evaluateBlackjackOutcome([{ blackjackValue: 10 }, { blackjackValue: 8 }], [{ blackjackValue: 10 }, { blackjackValue: 10 }, { blackjackValue: 4 }]).outcome, 'win');
});

test('Blackjack bankroll defaults safely and settles only fictional net stakes', () => {
	const values = new Map();
	const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
	const bankroll = new BlackjackBankroll(storage);
	assert.equal(bankroll.balance, 1000);
	assert.equal(bankroll.settle('loss', 50), -50);
	assert.equal(bankroll.balance, 950);
	assert.equal(bankroll.settle('blackjack', 100), 150);
	assert.equal(bankroll.balance, 1100);
});

test('Double Down creates one finite terminal result at doubled stake', () => {
	const players = createBlackjackPlayers(0);
	const events = [];
	const bankroll = { balance: 1000, canWager: amount => amount <= 1000, settle: (outcome, stake) => (outcome === 'win' ? stake : -stake) };
	const view = { showPlayerTurn() {}, setActions() {}, showRoundResult(result) { events.push(result); } };
	const round = new BlackjackRound({ players, renderer: { drawGame() {} }, view, bankroll, stake: 50, onComplete: result => events.push(result) });
	const cards = [5, 10, 6, 7, 10].map(blackjackValue => ({ blackjackValue, countValue: 0 }));
	round.shoe = { draw: () => cards.shift() || null, trueCount: () => 0 };
	assert.equal(round.start(), true);
	assert.equal(round.canDouble(), true);
	assert.equal(round.double(), true);
	assert.equal(round.phase, 'complete');
	assert.equal(events[0].stake, 100);
	assert.equal(events[0].outcome, 'win');
	assert.equal(round.finish(), false);
	assert.equal(events.length, 2);
});

test('Blackjack result reporter emits each run only once', () => {
	const reported = [];
	const reporter = new BlackjackResultReporter({ AwtsmoosGames: { reportResult: result => reported.push(result) } });
	const result = { runId: 'round:1', completed: true, score: 200 };
	assert.equal(reporter.report(result), true);
	assert.equal(reporter.report(result), false);
	assert.equal(reported.length, 1);
});

test('Short-landscape renderer gives four opponents distinct anchors', () => {
	globalThis.innerWidth = 844;
	globalThis.innerHeight = 390;
	const canvas = { width: 0, height: 0, getBoundingClientRect: () => ({ width: 844, height: 390 }) };
	const context = { canvas };
	canvas.getContext = () => context;
	const renderer = new ResponsiveRenderer(canvas);
	const points = Array.from({ length: 4 }, (_, index) => renderer.opponentLayout(index, 4));
	assert.equal(new Set(points.map(point => point.x)).size, 4);
	assert.ok(points.every(point => point.y < renderer.humanY()));
	renderer.dispose();
});

test('Blackjack live rewrite remains modular, documented, tabbed, and below 120 lines', async () => {
	const files = ['js/main.js', 'js/games/blackjack.js', 'js/games/blackjack/hand.js', 'js/games/blackjack/shoe.js', 'js/games/blackjack/bankroll.js', 'js/games/blackjack/players.js', 'js/games/blackjack/round.js', 'js/runtime/result.js', 'js/engine/responsive-renderer.js', 'js/ui/blackjack-view.js'];
	for (const relative of files) {
		const source = await readFile(new URL(`../cards/${relative}`, import.meta.url), 'utf8');
		assert.ok(source.split('\n').length < 120, `${relative} exceeds source law`);
		assert.match(source, /@(?:file|description)/, `${relative} lacks architectural JSDoc`);
		assert.equal(/^ +(?!\*)\S/m.test(source), false, `${relative} uses leading-space code indentation`);
	}
	const round = await readFile(new URL('../cards/js/games/blackjack/round.js', import.meta.url), 'utf8');
	assert.doesNotMatch(round, /setTimeout|setInterval/);
});
