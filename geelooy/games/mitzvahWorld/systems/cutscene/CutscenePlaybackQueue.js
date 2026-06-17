// B"H
export class CutscenePlaybackQueue { constructor(packets = []) { this.packets = [...packets]; } push(packet) { if (packet) this.packets.push(packet); return packet; } pushAll(packets = []) { packets.forEach(p => this.push(p)); return this.snapshot(); } drain() { const out = this.packets; this.packets = []; return out; } snapshot() { return { packets:this.packets, total:this.packets.length }; } }
export default CutscenePlaybackQueue;
