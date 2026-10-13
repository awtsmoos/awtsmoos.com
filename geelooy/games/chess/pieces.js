/* B"H */
/**
 * @file pieces.js
 * @description Premium Staunton chess piece renderer: hand-crafted vector
 * silhouettes with ivory/gold and obsidian/gold gradients, rim light, and
 * soft drop shadows. Resolution-independent — beautiful at any board size.
 * The Awtsmoos gives every vessel its dignified form; Awtsmoos.com draws
 * pieces worthy of the game instead of borrowed emoji.
 */

/**
 * Draw one chess piece centered at (x, y) with the given square size.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} piece 'K','Q','R','B','N','P' (uppercase=white, lowercase=black)
 * @param {number} x center x @param {number} y center y @param {number} size square size
 */
export function drawChessPiece(ctx, piece, x, y, size) {
	const isWhite = piece === piece.toUpperCase();
	const s = size * 0.82; // piece bounding size
	const top = y - s / 2, left = x - s / 2;
	ctx.save();
	ctx.translate(left, top);
	ctx.scale(s / 100, s / 100); // work in a 100x100 box
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';

	const pal = isWhite
		? { hi: '#fffdf4', mid: '#f0e6c8', lo: '#c9b98a', edge: '#7a6a3f', rim: '#e8c95c' }
		: { hi: '#6a6a80', mid: '#3a3a4c', lo: '#16161f', edge: '#050508', rim: '#d4af37' };

	const grad = (y0, y1) => {
		const g = ctx.createLinearGradient(0, y0, 0, y1);
		g.addColorStop(0, pal.hi);
		g.addColorStop(0.55, pal.mid);
		g.addColorStop(1, pal.lo);
		return g;
	};

	ctx.shadowColor = 'rgba(0,0,0,0.45)';
	ctx.shadowBlur = 6;
	ctx.shadowOffsetY = 3;

	const type = piece.toUpperCase();
	const body = grad(30, 100);
	ctx.fillStyle = body;
	ctx.strokeStyle = pal.edge;
	ctx.lineWidth = 2.2;

	// Shared pedestal base for every piece.
	function pedestal() {
		ctx.beginPath();
		ctx.moveTo(28, 100);
		ctx.lineTo(30, 88);
		ctx.quadraticCurveTo(50, 82, 70, 88);
		ctx.lineTo(72, 100);
		ctx.quadraticCurveTo(50, 105, 28, 100);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		// gold trim line
		ctx.strokeStyle = pal.rim;
		ctx.lineWidth = 1.4;
		ctx.beginPath();
		ctx.moveTo(31, 93);
		ctx.quadraticCurveTo(50, 88, 69, 93);
		ctx.stroke();
		ctx.strokeStyle = pal.edge;
		ctx.lineWidth = 2.2;
	}

	if (type === 'P') {
		// head
		ctx.beginPath(); ctx.arc(50, 26, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
		// collar
		ctx.beginPath();
		ctx.moveTo(38, 40); ctx.lineTo(62, 40); ctx.lineTo(58, 48); ctx.lineTo(42, 48);
		ctx.closePath(); ctx.fill(); ctx.stroke();
		// body
		ctx.beginPath();
		ctx.moveTo(42, 48); ctx.quadraticCurveTo(40, 68, 34, 86);
		ctx.lineTo(66, 86); ctx.quadraticCurveTo(60, 68, 58, 48);
		ctx.closePath(); ctx.fill(); ctx.stroke();
		pedestal();
	} else if (type === 'R') {
		// battlement top
		ctx.beginPath();
		ctx.moveTo(34, 34); ctx.lineTo(34, 18); ctx.lineTo(42, 18); ctx.lineTo(42, 26);
		ctx.lineTo(46, 26); ctx.lineTo(46, 18); ctx.lineTo(54, 18); ctx.lineTo(54, 26);
		ctx.lineTo(58, 26); ctx.lineTo(58, 18); ctx.lineTo(66, 18); ctx.lineTo(66, 34);
		ctx.closePath(); ctx.fill(); ctx.stroke();
		// neck ring
		ctx.beginPath(); ctx.rect(36, 36, 28, 6); ctx.fill(); ctx.stroke();
		// body
		ctx.beginPath();
		ctx.moveTo(38, 44); ctx.lineTo(62, 44); ctx.lineTo(66, 86); ctx.lineTo(34, 86);
		ctx.closePath(); ctx.fill(); ctx.stroke();
		pedestal();
	} else if (type === 'N') {
		// horse head profile, facing left
		ctx.beginPath();
		ctx.moveTo(66, 86);                    // back of neck base
		ctx.quadraticCurveTo(64, 60, 58, 48);  // neck back
		ctx.quadraticCurveTo(56, 38, 60, 30);  // crest
		ctx.lineTo(58, 18);                    // ear back
		ctx.lineTo(64, 26);
		ctx.lineTo(70, 16);                    // ear front
		ctx.lineTo(70, 28);
		ctx.quadraticCurveTo(62, 34, 52, 40);  // forehead
		ctx.lineTo(34, 52);                    // face to muzzle
		ctx.quadraticCurveTo(28, 56, 30, 62);  // nose
		ctx.lineTo(44, 64);                    // jaw
		ctx.quadraticCurveTo(52, 70, 54, 86);  // throat to base
		ctx.closePath(); ctx.fill(); ctx.stroke();
		// mane notches
		ctx.strokeStyle = pal.edge; ctx.lineWidth = 1.6;
		for (const [mx, my] of [[60, 44], [61, 54], [62, 64]]) {
			ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx - 7, my + 4); ctx.stroke();
		}
		// eye
		ctx.fillStyle = pal.edge;
		ctx.beginPath(); ctx.arc(52, 46, 2.4, 0, Math.PI * 2); ctx.fill();
		ctx.lineWidth = 2.2;
		pedestal();
	} else if (type === 'B') {
		// ball finial
		ctx.beginPath(); ctx.arc(50, 12, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
		// mitre
		ctx.beginPath();
		ctx.moveTo(50, 18);
		ctx.quadraticCurveTo(66, 30, 62, 52);
		ctx.quadraticCurveTo(56, 60, 50, 60);
		ctx.quadraticCurveTo(44, 60, 38, 52);
		ctx.quadraticCurveTo(34, 30, 50, 18);
		ctx.closePath(); ctx.fill(); ctx.stroke();
		// slit
		ctx.strokeStyle = pal.edge; ctx.lineWidth = 2.6;
		ctx.beginPath(); ctx.moveTo(50, 30); ctx.lineTo(50, 48); ctx.stroke();
		ctx.lineWidth = 2.2;
		// collar + body
		ctx.beginPath(); ctx.rect(40, 62, 20, 5); ctx.fill(); ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(42, 69); ctx.lineTo(58, 69); ctx.lineTo(64, 86); ctx.lineTo(36, 86);
		ctx.closePath(); ctx.fill(); ctx.stroke();
		pedestal();
	} else if (type === 'Q') {
		// crown: five points with orbs
		ctx.beginPath();
		ctx.moveTo(32, 44);
		ctx.lineTo(30, 22); ctx.lineTo(39, 34);
		ctx.lineTo(44, 16); ctx.lineTo(50, 30);
		ctx.lineTo(56, 16); ctx.lineTo(61, 34);
		ctx.lineTo(70, 22); ctx.lineTo(68, 44);
		ctx.closePath(); ctx.fill(); ctx.stroke();
		for (const ox of [30, 44, 56, 70]) {
			ctx.beginPath(); ctx.arc(ox, ox === 44 || ox === 56 ? 14 : 20, 3.4, 0, Math.PI * 2);
			ctx.fillStyle = pal.rim; ctx.fill();
			ctx.strokeStyle = pal.edge; ctx.lineWidth = 1.4; ctx.stroke();
			ctx.fillStyle = body; ctx.strokeStyle = pal.edge; ctx.lineWidth = 2.2;
		}
		// band + body
		ctx.beginPath(); ctx.rect(33, 46, 34, 7); ctx.fill(); ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(36, 55); ctx.lineTo(64, 55); ctx.lineTo(68, 86); ctx.lineTo(32, 86);
		ctx.closePath(); ctx.fill(); ctx.stroke();
		pedestal();
	} else if (type === 'K') {
		// cross finial
		ctx.fillStyle = pal.rim; ctx.strokeStyle = pal.edge; ctx.lineWidth = 1.8;
		ctx.beginPath(); ctx.rect(47.5, 6, 5, 16); ctx.fill(); ctx.stroke();
		ctx.beginPath(); ctx.rect(42, 11, 16, 5); ctx.fill(); ctx.stroke();
		ctx.fillStyle = body; ctx.strokeStyle = pal.edge; ctx.lineWidth = 2.2;
		// crown dome
		ctx.beginPath();
		ctx.moveTo(34, 46);
		ctx.quadraticCurveTo(34, 24, 50, 24);
		ctx.quadraticCurveTo(66, 24, 66, 46);
		ctx.closePath(); ctx.fill(); ctx.stroke();
		// crown points
		for (const px of [38, 50, 62]) {
			ctx.beginPath(); ctx.arc(px, 24, 3.2, 0, Math.PI * 2);
			ctx.fillStyle = pal.rim; ctx.fill();
			ctx.strokeStyle = pal.edge; ctx.lineWidth = 1.4; ctx.stroke();
			ctx.fillStyle = body; ctx.strokeStyle = pal.edge; ctx.lineWidth = 2.2;
		}
		// band + body
		ctx.beginPath(); ctx.rect(34, 48, 32, 7); ctx.fill(); ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(37, 57); ctx.lineTo(63, 57); ctx.lineTo(67, 86); ctx.lineTo(33, 86);
		ctx.closePath(); ctx.fill(); ctx.stroke();
		pedestal();
	}

	// rim light: thin bright stroke on the upper-left edges
	ctx.shadowColor = 'transparent';
	ctx.strokeStyle = isWhite ? 'rgba(255,255,255,0.75)' : 'rgba(232,201,92,0.6)';
	ctx.lineWidth = 1.2;
	ctx.beginPath();
	ctx.moveTo(36, 90); ctx.quadraticCurveTo(38, 60, 44, 40);
	ctx.stroke();
	ctx.restore();
}
