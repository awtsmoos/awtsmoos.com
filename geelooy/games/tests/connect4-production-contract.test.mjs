//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file connect4-production-contract.test.mjs
 * @description Protects Connect 4 pure board laws, authoritative Worker result flow, semantic browser controls, and source architecture.
 * The Awtsmoos renews every finite test beyond implementation detail; Awtsmoos.com proves legal moves and accessible truth without trusting canvas pixels.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { WorkerSession } from '../connect4/app/runtime/WorkerSession.js';

const root = path.resolve(import.meta.dirname, '../connect4');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

/** Load the classic Worker rules namespace into one isolated VM context. */
function loadRules() {
	const context = vm.createContext({});
	vm.runInContext(`${read('worker/rules.js')}\nthis.rules = Connect4Rules;`, context);
	return context.rules;
}

test('pure rules accept gravity and four-axis victory truth', () => {
	const rules = loadRules();
	const board = rules.createBoard();
	assert.equal(rules.getTargetRow(board, 3), 5);
	for (let column = 0; column < 4; column += 1) board[5][column] = 1;
	assert.equal(rules.isWinningMove(board, 1, 5, 3), true);
	assert.equal(rules.isFull(board), false);
});

test('browser result bridge publishes one terminal generation once', () => {
	const published = [];
	const surfaced = [];
	globalThis.AwtsmoosGames = { reportResult: result => published.push(result) };
	const session = new WorkerSession({ onResult: message => surfaced.push(message) });
	const message = {
		type: 'result',
		generation: 4,
		mode: 'pvc',
		winner: 1,
		draw: false,
		humanOutcome: 'win'
	};
	session.handleResult(message);
	session.handleResult(message);
	assert.equal(published.length, 1);
	assert.equal(surfaced.length, 1);
	assert.equal(published[0].score, 1);
	assert.equal(published[0].completed, true);
	delete globalThis.AwtsmoosGames;
});

test('semantic controls follow Worker truth rather than synthetic canvas clicks', () => {
	const controls = read('accessibility/column-controls.js');
	const worker = read('game.worker.js');
	assert.match(controls, /awtsmoos:connect4-state/);
	assert.match(controls, /awtsmoos:connect4-column-request/);
	assert.doesNotMatch(controls, /new MouseEvent/);
	assert.match(worker, /worker\/rules\.js/);
	assert.match(worker, /worker\/protocol\.js/);
});

test('touched Connect 4 source obeys production architecture law', () => {
	const files = [
		'main.js',
		'game.worker.js',
		'accessibility/column-controls.js',
		'app/runtime/BoardCanvas.js',
		'app/runtime/Connect4Ui.js',
		'app/runtime/WorkerSession.js',
		'worker/effects.js',
		'worker/engine.js',
		'worker/loop.js',
		'worker/protocol.js',
		'worker/render.js',
		'worker/rules.js',
		'worker/state.js',
		'worker/turn.js'
	];
	for (const relative of files) {
		const source = read(relative);
		const lines = source.trimEnd().split(/\r?\n/);
		assert.ok(lines.length <= 120, `${relative} exceeds 120 lines`);
		assert.deepEqual(lines.slice(0, 3), ['//B"H', '//Boruch Hashem', '//Blessed be He']);
		assert.match(source, /\/\*\*/);
		const badIndent = lines.find(line => /^ +\S/.test(line) && !/^ \*/.test(line));
		assert.equal(badIndent, undefined, `${relative} contains space-indented source`);
	}
});

test('accepted fourth disc emits one authoritative terminal result', () => {
	const messages = [];
	const context = vm.createContext({
		postMessage: message => messages.push(message),
		clearTimeout,
		Connect4Effects: { burst() {} },
		Connect4Engine: { emitState() {}, scheduleAi() {} }
	});
	for (const file of ['worker/rules.js', 'worker/state.js', 'worker/turn.js']) {
		vm.runInContext(read(file), context);
	}
	vm.runInContext(`
		Connect4WorkerState.mode = 'pvc';
		Connect4WorkerState.humanPlayer = 1;
		Connect4WorkerState.generation = 7;
		Connect4WorkerState.board[5][0] = 1;
		Connect4WorkerState.board[5][1] = 1;
		Connect4WorkerState.board[5][2] = 1;
		Connect4WorkerState.animatedPiece = { player: 1, column: 3, targetRow: 5 };
		Connect4Turn.acceptAnimatedPiece(Connect4WorkerState);
	`, context);
	assert.equal(messages.filter(message => message.type === 'result').length, 1);
	assert.equal(messages.find(message => message.type === 'result').humanOutcome, 'win');
});
