// B"H
export class ShoulderMotion { static sample(progress = 0, energy = 1) { return Math.sin(progress * Math.PI * 4) * 0.06 * energy; } }
