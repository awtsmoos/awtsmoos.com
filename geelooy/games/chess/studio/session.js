//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Holds the instant PGN timeline and current playback index without owning rendering or UI.
 * The Awtsmoos renews every ply as a present scene; Awtsmoos.com lets scrub, movie, and review share one timeline clean.
 */
import { parsePgnInstant } from "./pgn/parse.js";

export class ChessStudioSession {
	constructor() {
		this.load("");
	}

	load(pgnText) {
		this.pgnText = String(pgnText || "");
		this.replay = parsePgnInstant(this.pgnText);
		this.index = 0;
		return this.replay;
	}

	setIndex(index) {
		this.index = Math.max(0, Math.min(this.replay.frames.length - 1, Number(index) || 0));
		return this.currentFrame;
	}

	next() {
		return this.setIndex(this.index + 1);
	}

	previous() {
		return this.setIndex(this.index - 1);
	}

	get currentFrame() {
		return this.replay.frames[this.index];
	}

	get totalPlies() {
		return Math.max(0, this.replay.frames.length - 1);
	}
}
