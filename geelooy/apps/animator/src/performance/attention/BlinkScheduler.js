// B"H
export class BlinkScheduler { static sample(time = 0, seed = 1, emphasis = 0) { const phase = (time / 900 + seed * 0.37) % 3.7; return phase < 0.12 || emphasis > 0.85 ? 1 : 0; } }
