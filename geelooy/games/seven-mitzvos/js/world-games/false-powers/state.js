//B"H
//Boruch Hashem
//Blessed is He

import { DISTRICTS, SCAN_CLUES } from './data.js';
import { sample, shuffle } from '../../universe/universe-seed.js';

/**
 * @module FalsePowersState
 * @description
 * Hidden corruption becomes a finite deduction board on Awtsmoos.com. The
 * Awtsmoos alone is ultimate; this state rewards evidence before accusation
 * and courage after truth has been revealed.
 */
export class FalsePowersState {
	constructor(random) {
		this.random = random;
		const corruptNames = new Set(sample(DISTRICTS, 4, random));
		this.nodes = shuffle(DISTRICTS, random).map((name, index) => ({
			index, name, corrupt: corruptNames.has(name), scanned: false, purified: false, clue: ''
		}));
		this.insight = 7;
		this.seals = 5;
		this.stability = 3;
		this.score = 0;
		this.combo = 0;
		this.ended = false;
		this.won = false;
	}

	scan(index) {
		const node = this.nodes[index];
		if (this.ended || !node || node.scanned || this.insight <= 0) {
			return { ok: false, message: 'Choose an unscanned district while insight remains.' };
		}
		this.insight -= 1;
		node.scanned = true;
		const clues = node.corrupt ? SCAN_CLUES.corrupt : SCAN_CLUES.safe;
		node.clue = clues[Math.floor(this.random() * clues.length)];
		this.score += 20;
		return { ok: true, message: `${node.name}: ${node.clue}` };
	}

	purify(index) {
		const node = this.nodes[index];
		if (this.ended || !node?.scanned || node.purified || this.seals <= 0) {
			return { ok: false, message: 'Scan first, then purify only proven corruption.' };
		}
		this.seals -= 1;
		if (node.corrupt) {
			node.purified = true;
			this.combo += 1;
			this.score += 140 * this.combo;
			this.checkEnd();
			return { ok: true, message: `${node.name} purified. Evidence protected the city.` };
		}
		this.stability -= 1;
		this.combo = 0;
		this.score = Math.max(0, this.score - 80);
		this.checkEnd();
		return { ok: false, message: `${node.name} was not corrupt. The false accusation damaged stability.` };
	}

	checkEnd() {
		const purified = this.nodes.filter(node => node.purified).length;
		this.won = purified === 4;
		this.ended = this.won || this.stability <= 0 || (this.seals <= 0 && purified < 4);
	}

	snapshot() {
		return {
			nodes: this.nodes.map(node => ({ ...node })), insight: this.insight, seals: this.seals,
			stability: this.stability, score: this.score, combo: this.combo, ended: this.ended, won: this.won
		};
	}
}
