//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the chest plate vessel in this instant, revealing
 * its focused js render fighter hero body service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Taller sculpted chest plate.
 *
 * Chapter 220: the torso rises and narrows, less barrel and more suit. A single
 * subtle highlight preserves readability without extra clutter.
 */
import { roundRect } from './segment.js';
import { MOCKUP } from '../converter/MockupMeasurements.js';

/**
 * Reveals the draw chest plate behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} p The p value entering this behavior.
 * @param {*} mat The mat value entering this behavior.
 */
export function drawChestPlate(ctx, p, mat) {
	const s = p.scale || 1;
	ctx.save();
	drawNeck(ctx, p, mat, s);
	ctx.fillStyle = mat.shell;
	ctx.strokeStyle = mat.accent;
	ctx.lineWidth = 3.2 * s;
	ctx.beginPath();
	ctx.moveTo(p.leftShoulder.x - 8 * s, p.leftShoulder.y);
	ctx.quadraticCurveTo(
		p.chest.x,
		p.chest.y - 18 * s,
		p.rightShoulder.x + 8 * s,
		p.rightShoulder.y
	);
	ctx.quadraticCurveTo(
		p.chest.x + 26 * s,
		p.pelvis.y - 34 * s,
		p.rightHip.x + 12 * s,
		p.rightHip.y + 7 * s
	);
	ctx.quadraticCurveTo(
		p.pelvis.x,
		p.pelvis.y + 14 * s,
		p.leftHip.x - 12 * s,
		p.leftHip.y + 7 * s
	);
	ctx.quadraticCurveTo(
		p.chest.x - 26 * s,
		p.pelvis.y - 34 * s,
		p.leftShoulder.x - 8 * s,
		p.leftShoulder.y
	);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
	drawPanel(ctx, p, mat, s);
	ctx.restore();
}

function drawNeck(ctx, p, mat, s) {
	ctx.fillStyle = mat.shell;
	ctx.strokeStyle = mat.accent;
	ctx.lineWidth = 2.3 * s;
	roundRect(
		ctx,
		p.neck.x - (MOCKUP.neck.w * s) / 2,
		p.neck.y - 1 * s,
		MOCKUP.neck.w * s,
		MOCKUP.neck.h * s,
		8 * s
	);
	ctx.fill();
	ctx.stroke();
}

function drawPanel(ctx, p, mat, s) {
	ctx.globalAlpha = 0.13;
	ctx.strokeStyle = mat.glint;
	ctx.lineWidth = 1.2 * s;
	ctx.beginPath();
	ctx.moveTo(p.leftShoulder.x + 10 * s, p.leftShoulder.y + 8 * s);
	ctx.quadraticCurveTo(
		p.chest.x,
		p.chest.y - 4 * s,
		p.rightShoulder.x - 10 * s,
		p.rightShoulder.y + 8 * s
	);
	ctx.stroke();
	ctx.globalAlpha = 1;
}
