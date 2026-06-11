/** B"H — collision is the saying: this soul has reached that boundary. */
export function pointInRect(p, r) { return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h; }
export function circleHit(a, b, radius) { return (a.x - b.x) ** 2 + (a.y - b.y) ** 2 <= radius * radius; }
export function platformLanding(f, p) { return f.x > p.x && f.x < p.x + p.w && f.vy >= 0 && f.prevY <= p.y && f.y >= p.y - 9; }
