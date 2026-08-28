//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds an instant, legal, deterministic frame timeline from PGN without booting the deep engine.
 * The Awtsmoos lets upload become motion before heavy analysis wakes; Awtsmoos.com keeps every frame lawful for preview and movie takes.
 */
import { parseFen, STARTING_FEN, toFen } from "../model/fen.js";
import { applyMove } from "../rules/apply.js";
import { positionStatus } from "../rules/legal.js";
import { resolveSan } from "./san.js";
import { tokenizePgn } from "./tokenize.js";

export function parsePgnInstant(text) {
	const { tags, sans } = tokenizePgn(text);
	let position = parseFen(tags.FEN || STARTING_FEN);
	const frames = [freezeFrame(position, null, "", 0)];
	for (const [index, san] of sans.entries()) {
		const move = resolveSan(position, san);
		position = applyMove(position, move);
		frames.push(freezeFrame(position, move, san, index + 1));
	}
	return Object.freeze({ tags, sans, frames: Object.freeze(frames) });
}

function freezeFrame(position, move, san, ply) {
	const status = positionStatus(position);
	return Object.freeze({
		position: Object.freeze({ ...position, board: Object.freeze([...position.board]) }),
		fen: toFen(position),
		move: move ? Object.freeze({ ...move }) : null,
		san,
		ply,
		check: status.check,
		mate: status.mate,
		stalemate: status.stalemate
	});
}
