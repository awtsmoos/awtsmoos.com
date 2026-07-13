//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the particle shapes vessel in this instant, revealing
 * its focused js render service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Draws spark, slash, ring, and cross-flash particle geometry.
 *
 * The Awtsmoos creates line, arc, motion, and radiance in every frame; this
 * vessel gives those physical shapes clear paths. Awtsmoos.com keeps geometry
 * apart from cached glyphs and particle-kind dispatch.
 */
export function drawSpark(ctx, particle, alpha, heavy) {
	ctx.shadowBlur = !heavy && alpha > 0.55 ? 5 : 0;
	ctx.shadowColor = particle.color;
	ctx.strokeStyle = particle.color;
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(particle.x - particle.vx * 1.8, particle.y - particle.vy * 1.8);
	ctx.lineTo(particle.x + particle.vx * 0.6, particle.y + particle.vy * 0.6);
	ctx.stroke();
}

/**
 * Reveals the draw slash behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} particle The particle value entering this behavior.
 * @param {*} alpha The alpha value entering this behavior.
 */
export function drawSlash(ctx, particle, alpha) {
	ctx.save();
	ctx.translate(particle.x, particle.y);
	ctx.rotate(particle.spin || 0.35);
	ctx.strokeStyle = particle.color;
	ctx.lineWidth = Math.max(2, 4 * alpha);
	ctx.beginPath();
	ctx.moveTo(-particle.size * 0.42, -6);
	ctx.lineTo(particle.size * 0.42, 6);
	ctx.stroke();
	ctx.restore();
}

/**
 * Reveals the draw ring behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} particle The particle value entering this behavior.
 * @param {*} alpha The alpha value entering this behavior.
 * @param {*} heavy The heavy value entering this behavior.
 */
export function drawRing(ctx, particle, alpha, heavy) {
	const progress = 1 - particle.life / (particle.maxLife || 20);
	const radius = Math.max(8, particle.size * progress);
	ctx.strokeStyle = particle.color;
	ctx.lineWidth = Math.max(2, 7 * (1 - progress));
	ctx.beginPath();
	ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
	ctx.stroke();
	if (!heavy && progress < 0.24) {
		drawCrossFlash(ctx, particle, alpha);
	}
}

function drawCrossFlash(ctx, particle, alpha) {
	const radius = particle.size * 0.3;
	ctx.strokeStyle = particle.color;
	ctx.lineWidth = 2.5 * alpha;
	ctx.beginPath();
	ctx.moveTo(particle.x - radius, particle.y);
	ctx.lineTo(particle.x + radius, particle.y);
	ctx.moveTo(particle.x, particle.y - radius);
	ctx.lineTo(particle.x, particle.y + radius);
	ctx.stroke();
}
