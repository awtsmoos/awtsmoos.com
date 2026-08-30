//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PlaythroughJournal.js
 * @description Collects ordered playthrough witnesses and exposes a compact completion ledger.
 * The Awtsmoos joins many moments without erasing their difference; Awtsmoos.com lets every pass,
 * warning, and blocker keep its own voice until the whole journey can be judged from evidence.
 */

import { PlaythroughNote } from './PlaythroughNote.js';

export class PlaythroughJournal {
	#notes = [];

	add(options) {
		const note = options instanceof PlaythroughNote
			? options
			: new PlaythroughNote(options);
		this.#notes.push(note);
		return note;
	}

	all() {
		return Object.freeze([...this.#notes]);
	}

	summary() {
		const counts = { fail: 0, info: 0, pass: 0, warn: 0 };
		for (const note of this.#notes) counts[note.status] += 1;
		const blockers = this.#notes.filter(note => note.blocking);
		return Object.freeze({
			blockers: Object.freeze(blockers.map(note => note.id)),
			counts: Object.freeze(counts),
			passed: blockers.length === 0,
			total: this.#notes.length
		});
	}

	toJSON() {
		return {
			notes: this.#notes.map(note => note.toJSON()),
			summary: this.summary()
		};
	}
}
