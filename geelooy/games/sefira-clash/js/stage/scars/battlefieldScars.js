//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the battlefield scars vessel in this instant, revealing
 * its focused js stage scars service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Battlefield scars.
 *
 * Chapter 142: the stage remembers without becoming heavy. Cracks, burns, and
 * rune scars are cheap pooled marks that fade, proving where the war happened.
 */
const MAX_SCARS = 70;

/**
 * Reveals the add battlefield scar behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} state The state value entering this behavior.
 * @param {*} event The event value entering this behavior.
 */
export function addBattlefieldScar(state, event) {
	if (!event || (event.force || 0) < 14) return;
	state.scars ||= [];
	if (state.scars.length >= MAX_SCARS) state.scars.shift();
	state.scars.push({
		x: event.x,
		y: event.y + 55,
		life: 900,
		maxLife: 900,
		size: Math.min(90, 18 + (event.force || 12) * 1.3),
		color: event.color || '#ffcf7a',
		kind: scarKind(event),
		spin: Math.random() * Math.PI
	});
}

/**
 * Reveals the step battlefield scars behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} state The state value entering this behavior.
 */
export function stepBattlefieldScars(state) {
	const scars = state.scars || [];
	let write = 0;
	for (let i = 0; i < scars.length; i++) {
		const s = scars[i];
		s.life--;
		if (s.life > 0) scars[write++] = s;
	}
	scars.length = write;
}

/**
 * Reveals the draw battlefield scars behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} scars The scars value entering this behavior.
 */
export function drawBattlefieldScars(ctx, scars = []) {
	for (const s of scars) drawScar(ctx, s);
}

function drawScar(ctx, s) {
	const a = Math.max(0, s.life / s.maxLife);
	ctx.save();
	ctx.globalAlpha = Math.min(0.42, a * 0.42);
	ctx.translate(s.x, s.y);
	ctx.rotate(s.spin);
	ctx.strokeStyle = s.color;
	ctx.lineWidth = 2;
	if (s.kind === 'rune') drawRune(ctx, s.size);
	else drawCrack(ctx, s.size);
	ctx.restore();
}

function drawCrack(ctx, size) {
	ctx.beginPath();
	ctx.moveTo(-size * 0.45, 0);
	ctx.lineTo(-size * 0.1, -size * 0.14);
	ctx.lineTo(size * 0.2, size * 0.08);
	ctx.lineTo(size * 0.48, -size * 0.05);
	ctx.stroke();
}

function drawRune(ctx, size) {
	ctx.font = `900 ${Math.max(18, size * 0.44)}px serif`;
	ctx.textAlign = 'center';
	ctx.fillStyle = '#fff4b8';
	ctx.fillText('א', 0, 0);
}

function scarKind(event) {
	return (event.force || 0) > 35 || event.koDanger ? 'rune' : 'crack';
}
