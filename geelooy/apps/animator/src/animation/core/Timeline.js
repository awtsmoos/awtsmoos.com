// B"H
export class Timeline { constructor({ duration = 1000, tracks = [] } = {}) { this.duration = duration; this.tracks = tracks; } sample(time) { return Object.fromEntries(this.tracks.map(t => [t.id, t.sample(time)])); } }
