// B"H
/** @file MovieDirectorBridge.js @description Movie commands bind to the same runtime entities the game uses. */
export class MovieDirectorBridge {
  constructor(runtime) { this.runtime = runtime; this.timeline = null; this.cursor = 0; this.playing = false; }
  load(compiled) { this.timeline = compiled; this.cursor = 0; return compiled; }
  play() { this.playing = true; this.runtime?.markLoading?.("movie:playback", 10); return this.snapshot(); }
  stop() { this.playing = false; this.runtime?.markReady?.("movie:playback"); return this.snapshot(); }
  seek(time = 0) { this.cursor = Math.max(0, Number(time) || 0); return this.activeCommands(); }
  activeCommands() { const t = this.cursor; return (this.timeline?.commands || []).filter(c => c.at <= t && t <= c.at + Math.max(.01, c.duration)); }
  snapshot() { return { playing:this.playing, cursor:this.cursor, timeline:this.timeline?.id || null, active:this.activeCommands() }; }
}
export function createMovieDirectorBridge(runtime) { return new MovieDirectorBridge(runtime); }
export default createMovieDirectorBridge;
