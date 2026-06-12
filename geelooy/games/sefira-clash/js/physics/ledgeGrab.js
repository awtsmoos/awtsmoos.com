/**
 * B"H
 * Ledge grab and ledge escape.
 *
 * Chapter 186: the lip of stone becomes mercy. A falling fighter near a safe
 * edge catches it, hangs briefly, then may jump, climb, or release into air.
 */
export function updateLedgeGrab(f, map, input) {
  if (f.grounded || f.grabbedBy) return;
  if (f.ledgeHang) return updateHang(f, input);
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
  if (input.jump) ledgeJump(f);
  else if (input.x && Math.sign(input.x) === -f.ledgeHang.side) release(f);
  else if (f.ledgeHang.timer <= 0) release(f);
}

function ledgeJump(f) {
  const side = f.ledgeHang.side;
  f.vx = side * 8;
  f.vy = -17;
  f.jumpsUsed = 1;
  f.ledgeHang = null;
}

function release(f) {
  f.ledgeHang = null;
  f.vy = 2;
}

function nearestLedge(f, platforms) {
  let best = null;
  let dist = 58;
  for (const p of platforms) {
    for (const edge of [{ x: p.x, side: -1 }, { x: p.x + p.w, side: 1 }]) {
      const dx = Math.abs(f.x - edge.x);
      const dy = Math.abs((f.y - 120) - p.y);
      if (dx < dist && dy < 62) { best = { x: edge.x, y: p.y, side: edge.side }; dist = dx; }
    }
  }
  return best;
}
