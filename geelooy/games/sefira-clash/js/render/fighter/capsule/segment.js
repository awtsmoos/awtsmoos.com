//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the segment vessel in this instant, revealing
 * its focused js render fighter capsule service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Capsule segment painter.
 *
 * Chapter 121: limbs become vessels, not raw lines. Each arm and leg receives
 * width, shadow, and rounded joints so motion reads as body instead of wire.
 */
function angle(a, b) {
	return Math.atan2(b.y - a.y, b.x - a.x);
}

function len(a, b) {
	return Math.hypot(b.x - a.x, b.y - a.y);
}

/**
 * Reveals the capsule segment behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} a The a value entering this behavior.
 * @param {*} b The b value entering this behavior.
 * @param {*} width The width value entering this behavior.
 * @param {*} color The color value entering this behavior.
 * @param {*} options The options value entering this behavior.
 */
export function capsuleSegment(ctx, a, b, width, color, options = {}) {
	const length = len(a, b);
	if (!Number.isFinite(length) || length < 2) return;
	ctx.save();
	ctx.translate(a.x, a.y);
	ctx.rotate(angle(a, b));
	ctx.fillStyle = options.shadow ? 'rgba(2,3,6,.88)' : color;
	ctx.strokeStyle = options.stroke || 'rgba(0,0,0,.75)';
	ctx.lineWidth = options.lineWidth || 2;
	roundRect(ctx, 0, -width / 2, length, width, width / 2);
	ctx.fill();
	ctx.stroke();
	if (!options.shadow) {
		ctx.globalAlpha = 0.22;
		ctx.fillStyle = 'rgba(255,255,255,.6)';
		roundRect(ctx, length * 0.12, -width * 0.34, length * 0.42, width * 0.18, width * 0.09);
		ctx.fill();
	}
	ctx.restore();
}

/**
 * Reveals the joint behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} p The p value entering this behavior.
 * @param {*} r The r value entering this behavior.
 * @param {*} color The color value entering this behavior.
 */
export function joint(ctx, p, r, color) {
	ctx.save();
	ctx.fillStyle = color;
	ctx.strokeStyle = 'rgba(0,0,0,.75)';
	ctx.lineWidth = 1.5;
	ctx.beginPath();
	ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();
	ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.lineTo(x + w - r, y);
	ctx.quadraticCurveTo(x + w, y, x + w, y + r);
	ctx.lineTo(x + w, y + h - r);
	ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
	ctx.lineTo(x + r, y + h);
	ctx.quadraticCurveTo(x, y + h, x, y + h - r);
	ctx.lineTo(x, y + r);
	ctx.quadraticCurveTo(x, y, x + r, y);
}
