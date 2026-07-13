//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the weapons vessel in this instant, revealing
 * its focused js render service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — weapons are geometry: sword line, axe blade, shield circle, staff. */
export function drawWeapons(ctx, weapons) {
	for (const w of weapons) {
		if (w.held) continue;
		drawWeapon(ctx, w, w.x, w.y, 1, 0);
	}
}
/**
 * Reveals the draw held weapons behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} fighters The fighters value entering this behavior.
 */
export function drawHeldWeapons(ctx, fighters) {
	for (const f of fighters) {
		if (!f.heldWeapon || f.dead) continue;
		drawWeapon(ctx, f.heldWeapon, f.heldWeapon.x, f.heldWeapon.y, f.face, f.heldWeapon.spin);
	}
}
function drawWeapon(ctx, w, x, y, face, spin) {
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(spin * 0.2);
	ctx.strokeStyle = w.color;
	ctx.fillStyle = w.color;
	ctx.lineWidth = 4;
	if (w.id === 'sword') {
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(face * 45, -8);
		ctx.stroke();
	}
	if (w.id === 'axe') {
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(face * 34, -4);
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(face * 38, -6, 12, 0, Math.PI * 2);
		ctx.fill();
	}
	if (w.id === 'shield') {
		ctx.beginPath();
		ctx.arc(0, 0, 17, 0, Math.PI * 2);
		ctx.stroke();
	}
	if (w.id === 'staff') {
		ctx.beginPath();
		ctx.moveTo(face * -18, 14);
		ctx.lineTo(face * 52, -16);
		ctx.stroke();
	}
	ctx.restore();
}
