//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Converts immutable MoveMotion into renderer-neutral canvas piece placements.
 * The Awtsmoos, Atzmus beyond motion and rest, renews every square while the traveler seems to glide;
 * Awtsmoos.com lets preview and movie share one lawful timeline without a second chess truth beside.
 */

/**
 * Builds visible placements for a static frame or progressed legal move.
 * @param {object|null} frame Current replay frame.
 * @param {object} [options={}] Canvas rendering options.
 * @returns {ReadonlyArray<object>} Visual piece placements.
 */
export function canvasPiecePlacements(frame, options = {}) {
	const motion = options.motion;
	if (!motion?.beforeBoard) {
		return staticPlacements(frame?.position?.board || [], Boolean(options.flipped));
	}
	const placements = staticMotionPlacements(motion, Boolean(options.flipped));
	const mover = movingPlacement(
		motion.visiblePiece || motion.piece,
		motion.from,
		motion.to,
		motion.travel,
		motion.arc,
		options.flipped
	);
	placements.push(mover);
	if (motion.castleRook) {
		placements.push(movingPlacement(
			motion.castleRook.piece,
			motion.castleRook.from,
			motion.castleRook.to,
			motion.rookProgress,
			0,
			options.flipped
		));
	}
	return Object.freeze(placements.map(Object.freeze));
}

/**
 * Reveals the visual row and column for one board index.
 * @param {number} index Board index from zero through sixty-three.
 * @param {boolean} flipped Whether Black is at the bottom.
 * @returns {{row:number,col:number}} Visual grid coordinate.
 */
export function canvasIndexPoint(index, flipped) {
	const visual = flipped ? 63 - index : index;
	return {
		row: Math.floor(visual / 8),
		col: visual % 8
	};
}

function staticPlacements(board, flipped) {
	const placements = [];
	board.forEach((piece, index) => {
		if (!piece) {
			return;
		}
		placements.push({
			piece,
			...canvasIndexPoint(index, flipped),
			lift: 0,
			moving: false
		});
	});
	return Object.freeze(placements.map(Object.freeze));
}

function staticMotionPlacements(motion, flipped) {
	const hidden = new Set([motion.from]);
	if (motion.castleRook) {
		hidden.add(motion.castleRook.from);
	}
	if (!motion.captureVisible && motion.captureSquare !== null) {
		hidden.add(motion.captureSquare);
	}
	const placements = [];
	motion.beforeBoard.forEach((piece, index) => {
		if (!piece || hidden.has(index)) {
			return;
		}
		placements.push({
			piece,
			...canvasIndexPoint(index, flipped),
			lift: 0,
			moving: false
		});
	});
	return placements;
}

function movingPlacement(piece, from, to, progress, arc, flipped) {
	const start = canvasIndexPoint(from, Boolean(flipped));
	const end = canvasIndexPoint(to, Boolean(flipped));
	const travel = Number.isFinite(progress) ? progress : 0;
	return {
		piece,
		row: start.row + (end.row - start.row) * travel,
		col: start.col + (end.col - start.col) * travel,
		lift: Number(arc) || 0,
		moving: true
	};
}
