//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds an instant legal PGN timeline and enriches every played move with shared deterministic semantics.
 * The Awtsmoos turns written notation into lawful positions and then reveals one meaning-stream through every frame;
 * Awtsmoos.com lets camera, cinema, and coaching receive that shared light without reparsing the game.
 */
import { parseFen, STARTING_FEN, toFen } from "../model/fen.js";
import { applyMove } from "../rules/apply.js";
import { positionStatus } from "../rules/legal.js";
import { attachReplayEvents } from "../semantics/replayEvents.js";
import { resolveSan } from "./san.js";
import { tokenizePgn } from "./tokenize.js";

/**
 * Parses PGN into frozen legal frames with immutable MoveEvents.
 * @param {string} text PGN source.
 * @returns {Readonly<{tags:object,sans:Array<string>,frames:ReadonlyArray<object>}>} Replay timeline.
 */
export function parsePgnInstant(text) {
	const { tags, sans } = tokenizePgn(text);
	let position = parseFen(tags.FEN || STARTING_FEN);
	const rawFrames = [freezeFrame(position, null, "", 0)];
	for (const [index, san] of sans.entries()) {
		const move = resolveSan(position, san);
		position = applyMove(position, move);
		rawFrames.push(freezeFrame(position, move, san, index + 1));
	}
	return Object.freeze({ tags, sans, frames: attachReplayEvents(rawFrames) });
}

/**
 * Freezes one lawful post-move position before semantic enrichment.
 * @param {object} position Legal chess position.
 * @param {object|null} move Applied move.
 * @param {string} san SAN token.
 * @param {number} ply Half-move number.
 * @returns {Readonly<object>} Base replay frame.
 */
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
