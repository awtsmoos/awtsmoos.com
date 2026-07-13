//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the draw hands feet vessel in this instant, revealing
 * its focused js render fighter limbs service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Refined hands and planted feet.
 *
 * Chapter 105: the hand knows the strike and the foot knows the floor. The
 * Awtsmoos turns raw dots into small readable body parts, oriented by bones.
 */
function angleOf(bone) {
	if (!bone?.root || !bone?.tip) return 0;
	return Math.atan2(bone.tip.y - bone.root.y, bone.tip.x - bone.root.x);
}

function tip(bone) {
	return bone?.tip && Number.isFinite(bone.tip.x) ? bone.tip : null;
}

function drawTip(ctx, bone, rx, ry, color, foot = false) {
	const p = tip(bone);
	if (!p) return;
	ctx.save();
	ctx.translate(p.x, p.y);
	ctx.rotate(foot ? 0 : angleOf(bone));
	ctx.fillStyle = color;
	ctx.strokeStyle = 'rgba(0,0,0,.72)';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();
	if (foot) {
		ctx.globalAlpha = 0.65;
		ctx.beginPath();
		ctx.moveTo(-rx * 0.8, ry * 0.55);
		ctx.lineTo(rx * 0.9, ry * 0.55);
		ctx.stroke();
	}
	ctx.restore();
}

/**
 * Reveals the draw hands feet behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} color The color value entering this behavior.
 * @param {*} language The language value entering this behavior.
 */
export function drawHandsFeet(ctx, f, color, language = {}) {
	const hand = Math.max(5.5, Math.min(8.5, language.handSize || 7));
	const foot = Math.max(9, Math.min(14, language.footSize || 11));
	drawTip(ctx, f.bones.leftLowerArm, hand, hand * 0.72, color, false);
	drawTip(ctx, f.bones.rightLowerArm, hand, hand * 0.72, color, false);
	drawTip(ctx, f.bones.leftCalf, foot, foot * 0.38, color, true);
	drawTip(ctx, f.bones.rightCalf, foot, foot * 0.38, color, true);
}
