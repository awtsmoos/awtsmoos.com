// B"H
export class Track { constructor(id, keyframes = []) { this.id = id; this.keyframes = keyframes; } sample(time) { return this.keyframes.findLast?.(k => k.time <= time)?.value || this.keyframes[0]?.value || {}; } }
