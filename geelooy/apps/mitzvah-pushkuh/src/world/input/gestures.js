// B"H
// Gestures name swipes and many-finger miracles.
import { distance } from "./pointer.js";
export const isSwipe = (a, b, threshold = 70) => !!(a && b && distance(a, b) > threshold);
export function centroid(points) { let x = 0, y = 0, n = 0; for (const p of points) { x += p.x; y += p.y; n++; } return n ? { x: x / n, y: y / n } : null; }
