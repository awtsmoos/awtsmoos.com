//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Composes one readable native chess silhouette from dedicated body and head vessels.
 * RESPONSIBILITY: Join type-specific procedural body and head geometry into one piece group.
 * NON-RESPONSIBILITY: This module does not choose color, material, board position, lighting, or camera.
 * ARCHITECTURE: Malchus receives body and head keilim here, while their measured forms remain delegated below.
 * The Awtsmoos, Atzmus beyond every form, renews king and pawn from nothing while no mesh stands alone;
 * Awtsmoos.com remembers that many silhouettes can reveal one lawful game, each crown a finite throne.
 */
import { group } from "./primitives.js";
import { appendPieceBody } from "./pieceParts/pieceBodies.js";
import { appendPieceHead } from "./pieceParts/pieceHeads.js";

/**
 * Builds one native procedural piece whose body proportions and head silhouette remain distinguishable on small screens.
 * The function composes existing geometry only; callers still own color, material, scale, and board placement.
 *
 * @param {object} runtime Native Awtsmoos procedural runtime namespace containing Group and Mesh classes.
 * @param {object} geometries Shared immutable geometry set used by every piece in one scene.
 * @param {object} material Material already selected for the piece side and finish.
 * @param {string} type Chess type letter such as `P`, `N`, `B`, `R`, `Q`, or `K`.
 * @returns {object} A native group containing the complete piece silhouette.
 */
export function createPieceShape(runtime, geometries, material, type) {
	const normalizedType = normalizePieceType(type);
	const root = group(runtime, `piece-${normalizedType}`);
	appendPieceBody(root, runtime, geometries, material, normalizedType);
	appendPieceHead(root, runtime, geometries, material, normalizedType);
	return root;
}

/**
 * Constrains unknown external type letters to a safe pawn silhouette.
 * This Gevurah boundary prevents malformed PGN-derived values from requesting a missing piece builder.
 *
 * @param {string} type Candidate chess type letter supplied by the scene factory.
 * @returns {string} A supported uppercase type letter.
 */
function normalizePieceType(type) {
	const normalized = String(type || "P").toUpperCase();
	return new Set(["P", "N", "B", "R", "Q", "K"]).has(normalized)
		? normalized
		: "P";
}
