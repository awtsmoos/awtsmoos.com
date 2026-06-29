// B"H
// Noise is ordered uncertainty, so living motion never loops like a machine.
import { wave } from "../wave.js";
export function noise2(x = 0, y = 0) { return wave(x * .73 + y * 1.37) * .5 + wave(x * 1.91 - y * .29) * .25; }
export function curl(x, y, t = 0) { return { x: noise2(y + t, x) * .8, y: noise2(x - t, y) * .8 }; }
