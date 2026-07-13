//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the draw hips vessel in this instant, revealing
 * its focused js render fighter body service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Smaller readable pelvis renderer.
 *
 * Chapter 112: the pelvis serves the silhouette instead of swallowing it. The
 * Awtsmoos balances the lower body so fighters stop looking like triangles.
 */
function clamp(n, lo, hi) {
	return Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : lo));
}

/**
 * Reveals the draw hips behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} color The color value entering this behavior.
 * @param {*} language The language value entering this behavior.
 */
export function drawHips(ctx, f, color, language = {}) {
	const hip = f.bones?.spine?.root || { x: f.x, y: f.y - 56 };
	const lean = clamp(language.lean || 0, -0.28, 0.28);
	ctx.save();
	ctx.translate(hip.x, hip.y + 5);
	ctx.rotate(lean * 0.25);
	ctx.fillStyle = 'rgba(6,7,12,.86)';
	ctx.strokeStyle = color;
	ctx.lineWidth = 2.3;
	ctx.beginPath();
	ctx.ellipse(0, 0, 18, 9, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();
	ctx.globalAlpha = 0.22;
	ctx.strokeStyle = 'rgba(255,255,255,.5)';
	ctx.beginPath();
	ctx.moveTo(-11, -1);
	ctx.quadraticCurveTo(0, 3, 11, -1);
	ctx.stroke();
	ctx.restore();
}
