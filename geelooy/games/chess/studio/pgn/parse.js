//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds an instant legal PGN timeline and carries normalized move timing into every semantic replay frame.
 * The Awtsmoos turns notation into lawful position while each measured instant remains joined to its move;
 * Awtsmoos.com lets camera, cinema, and coaching share one replay truth instead of parsing clocks anew.
 */
import { parseFen, STARTING_FEN, toFen } from "../model/fen.js";
import { applyMove } from "../rules/apply.js";
import { positionStatus } from "../rules/legal.js";
import { attachReplayEvents } from "../semantics/replayEvents.js";
import { resolveSan } from "./san.js";
import { tokenizePgn } from "./tokenize.js";

/**
 * Parses PGN-compatible text into frozen legal frames, structured moves, and immutable MoveEvents.
 * @param {string} text PGN or PGN-compatible LGB source.
 * @returns {Readonly<{tags:object,sans:ReadonlyArray<string>,moves:ReadonlyArray<object>,frames:ReadonlyArray<object>}>} Replay timeline.
 */
export function parsePgnInstant(text) {
	const { tags, sans, moves } = tokenizePgn(text);
	let position = parseFen(tags.FEN || STARTING_FEN);
	const rawFrames = [freezeFrame(position, null, "", 0, null)];
	for (const [index, moveRecord] of moves.entries()) {
		const move = resolveSan(position, moveRecord.san);
		position = applyMove(position, move);
		rawFrames.push(freezeFrame(
			position,
			move,
			moveRecord.san,
			index + 1,
			moveRecord.timing
		));
	}
	return Object.freeze({
		tags,
		sans,
		moves,
		frames: attachReplayEvents(rawFrames)
	});
}

/**
 * Freezes one lawful post-move position before semantic enrichment.
 * @param {object} position Legal chess position.
 * @param {object|null} move Applied move.
 * @param {string} san SAN token.
 * @param {number} ply Half-move number.
 * @param {object|null} timing Normalized timing annotation.
 * @returns {Readonly<object>} Base replay frame.
 */
function freezeFrame(position, move, san, ply, timing) {
	const status = positionStatus(position);
	return Object.freeze({
		position: Object.freeze({ ...position, board: Object.freeze([...position.board]) }),
		fen: toFen(position),
		move: move ? Object.freeze({ ...move }) : null,
		san,
		ply,
		timing,
		check: status.check,
		mate: status.mate,
		stalemate: status.stalemate
	});
}
