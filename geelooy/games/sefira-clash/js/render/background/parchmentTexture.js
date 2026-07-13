//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the parchment texture vessel in this instant, revealing
 * its focused js render background service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H — Procedural parchment cache. The texture is made from translucent
 * stains, threads, specks, and edge-aging, then reused so mobile phones do
 * not pay the cost every frame.
 */
const cache = new Map();

/**
 * Reveals the parchment texture behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} w The w value entering this behavior.
 * @param {*} h The h value entering this behavior.
 * @param {*} palette The palette value entering this behavior.
 */
export function parchmentTexture(w, h, palette) {
	const key = `${w}x${h}:${palette.skyTop}:${palette.skyBottom}`;
	if (cache.has(key)) return cache.get(key);
	const cnv = new OffscreenCanvas(w, h);
	const ctx = cnv.getContext('2d');
	drawBase(ctx, w, h, palette);
	drawFibers(ctx, w, h);
	drawStains(ctx, w, h, palette);
	drawEdges(ctx, w, h);
	cache.set(key, cnv);
	return cnv;
}

function drawBase(ctx, w, h, p) {
	const g = ctx.createLinearGradient(0, 0, 0, h);
	g.addColorStop(0, p.skyTop);
	g.addColorStop(1, p.skyBottom);
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, w, h);
}

function drawFibers(ctx, w, h) {
	ctx.globalAlpha = 0.08;
	ctx.strokeStyle = '#1d160f';
	for (let i = 0; i < 420; i++) {
		const y = Math.random() * h;
		ctx.beginPath();
		ctx.moveTo(Math.random() * w, y);
		ctx.lineTo(Math.random() * w, y + Math.random() * 18 - 9);
		ctx.stroke();
	}
	ctx.globalAlpha = 1;
}

function drawStains(ctx, w, h, p) {
	for (let i = 0; i < 36; i++) {
		const x = Math.random() * w;
		const y = Math.random() * h;
		const r = 25 + Math.random() * 120;
		const g = ctx.createRadialGradient(x, y, 0, x, y, r);
		g.addColorStop(0, p.stain);
		g.addColorStop(1, 'transparent');
		ctx.fillStyle = g;
		ctx.fillRect(x - r, y - r, r * 2, r * 2);
	}
}

function drawEdges(ctx, w, h) {
	const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.72);
	g.addColorStop(0, 'transparent');
	g.addColorStop(1, 'rgba(0,0,0,.32)');
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, w, h);
}
