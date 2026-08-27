// B"H
export class HeadMotion { static sample(time = 0, progress = 0, energy = 1) { return { tilt: Math.sin(time / 1200) * 2, nod: Math.sin(progress * Math.PI * 5) * 2.2 * energy }; } }
