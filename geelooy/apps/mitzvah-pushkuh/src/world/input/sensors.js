// B"H
// Sensors translate tilt into a sparse blessing point.
export function tiltPoint(e, w = innerWidth, h = innerHeight) {
  return { x: w * (.5 + (e.gamma || 0) / 90), y: h * (.5 + (e.beta || 0) / 180) };
}
