// B"H
/** JourneyRegion: each apparent freedom is a gate to a higher freedom. */
export class JourneyRegion { constructor({ id, name, start, end, mood, symbol }) { Object.assign(this, { id, name, start, end, mood, symbol }); } contains(t) { return t >= this.start && t < this.end; } }
export default JourneyRegion;
