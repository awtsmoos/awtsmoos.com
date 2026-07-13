//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the ledge grab vessel in this instant, revealing
 * its focused js physics service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Ledge grab and ledge escape with intentional drop immunity.
 *
 * Chapter 295: when the player points downward, the ledge must not become a
 * jailer. Down-drop creates a no-grab window, and holding down while hanging
 * releases below the stone instead of snapping back to the lip.
 */
export function updateLedgeGrab(f, map, input) {
	f.noLedgeTimer = Math.max(0, (f.noLedgeTimer || 0) - 1);
	if (f.grounded || f.grabbedBy) return;
	if (f.ledgeHang) return updateHang(f, input);
	if (ledgeSuppressed(f, input)) return;
	if (f.vy < -1) return;
	const ledge = nearestLedge(f, map.platforms || []);
	if (!ledge) return;
	f.ledgeHang = { x: ledge.x, y: ledge.y, side: ledge.side, timer: 70 };
	f.x = ledge.x;
	f.y = ledge.y + 130;
	f.vx = 0;
	f.vy = 0;
	f.stun = 0;
}

function updateHang(f, input) {
	f.ledgeHang.timer--;
	f.x = f.ledgeHang.x;
	f.y = f.ledgeHang.y + 130;
	f.vx = 0;
	f.vy = 0;
	if (wantsDown(input)) dropRelease(f);
	else if (input.jump) ledgeJump(f);
	else if (input.x && Math.sign(input.x) === -f.ledgeHang.side) sideRelease(f);
	else if (f.ledgeHang.timer <= 0) sideRelease(f);
}

function ledgeSuppressed(f, input) {
	return (f.noLedgeTimer || 0) > 0 || (f.dropTimer || 0) > 0 || wantsDown(input);
}

function wantsDown(input) {
	return !!input.down || input.y > 0.42 || input.aimY > 0.42;
}

function ledgeJump(f) {
	const side = f.ledgeHang.side;
	f.vx = side * 8;
	f.vy = -17;
	f.jumpsUsed = 1;
	f.noLedgeTimer = 18;
	f.ledgeHang = null;
}

function sideRelease(f) {
	f.ledgeHang = null;
	f.noLedgeTimer = 18;
	f.vy = 2.4;
}

function dropRelease(f) {
	const side = f.ledgeHang.side;
	f.x += side * 18;
	f.y += 48;
	f.vx = side * 2.5;
	f.vy = 6;
	f.dropTimer = 28;
	f.noLedgeTimer = 32;
	f.ledgeHang = null;
}

function nearestLedge(f, platforms) {
	let best = null;
	let dist = 58;
	for (const p of platforms) {
		for (const edge of [
			{ x: p.x, side: -1 },
			{ x: p.x + p.w, side: 1 }
		]) {
			const dx = Math.abs(f.x - edge.x);
			const dy = Math.abs(f.y - 120 - p.y);
			if (dx < dist && dy < 62) {
				best = { x: edge.x, y: p.y, side: edge.side };
				dist = dx;
			}
		}
	}
	return best;
}
