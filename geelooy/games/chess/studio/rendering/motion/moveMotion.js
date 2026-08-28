//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Describes and interpolates legal piece motion without mutating replay frames or depending on a renderer.
 * The Awtsmoos reveals one lawful transition as measured travel from origin toward destination in time;
 * Awtsmoos.com lets preview and cinema consume the same immutable motion truth in one shared rhyme.
 */

/**
 * Builds an immutable motion descriptor from adjacent legal replay frames.
 * @param {object|null} beforeFrame Frame before the move.
 * @param {object|null} afterFrame Frame after the move.
 * @returns {Readonly<object>|null} Motion descriptor or null when no move exists.
 */
export function createMoveMotion(beforeFrame, afterFrame) {
	const move = afterFrame?.move;
	if (!move || !beforeFrame?.position) return null;
	const moverColor = move.piece?.[0] || beforeFrame.position.turn;
	const castleRook = move.castle ? castleRookMove(move) : null;
	return Object.freeze({
		ply: afterFrame.ply,
		kind: afterFrame.event?.kind || moveKind(move),
		piece: move.piece,
		from: move.from,
		to: move.to,
		promotion: move.promotion || null,
		captureSquare: move.capture ? captureSquare(move, moverColor) : null,
		castleRook,
		beforeBoard: Object.freeze([...beforeFrame.position.board]),
		afterBoard: Object.freeze([...afterFrame.position.board])
	});
}

/**
 * Adds a bounded animation progress to an immutable motion descriptor.
 * @param {object|null} motion Base motion.
 * @param {number} progress Raw progress from 0 through 1.
 * @returns {Readonly<object>|null} Progressed motion state.
 */
export function withMoveMotionProgress(motion, progress) {
	if (!motion) return null;
	const raw = clamp(progress);
	const travel = smooth(raw);
	const arc = arcHeight(motion, travel);
	const rookProgress = motion.castleRook ? smooth(clamp((raw - 0.06) / 0.9)) : 0;
	return Object.freeze({
		...motion,
		progress: raw,
		travel,
		arc,
		rookProgress,
		captureVisible: motion.captureSquare === null || raw < 0.58,
		visiblePiece: motion.promotion && raw > 0.76 ? `${motion.piece[0]}${motion.promotion}` : motion.piece
	});
}

function castleRookMove(move) {
	const kingSide = move.to > move.from;
	return Object.freeze({
		from: kingSide ? move.to + 1 : move.to - 2,
		to: kingSide ? move.to - 1 : move.to + 1,
		piece: `${move.piece[0]}R`
	});
}

function captureSquare(move, moverColor) {
	if (!move.enPassant) return move.to;
	return move.to + (moverColor === "w" ? 8 : -8);
}

function moveKind(move) {
	if (move.castle) return "castle";
	if (move.promotion) return "promotion";
	if (move.enPassant) return "en-passant";
	if (move.capture) return "capture";
	return "quiet";
}

function arcHeight(motion, progress) {
	const wave = Math.sin(Math.PI * progress);
	if (motion.piece?.[1] === "N") return wave * 0.62;
	if (motion.kind === "capture" || motion.kind === "en-passant") return wave * 0.2;
	if (motion.kind === "promotion") return wave * 0.28;
	return wave * 0.08;
}

function smooth(value) {
	return value * value * (3 - 2 * value);
}

function clamp(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}
