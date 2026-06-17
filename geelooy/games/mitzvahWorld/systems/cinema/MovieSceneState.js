// B"H
/** Tracks which movie scene is armed, playing, or finished. */
export class MovieSceneState {
  constructor() { this.current = null; this.history = []; }
  start(plan) { this.current = { id:plan.id, title:plan.title, startedAt:Date.now(), duration:plan.duration || 0 }; this.history.push({ type:"start", ...this.current }); return this.current; }
  finish(reason = "complete") { const row = { type:"finish", id:this.current?.id || null, reason, at:Date.now() }; this.history.push(row); this.current = null; return row; }
  snapshot() { return { current:this.current, history:this.history.slice(-30) }; }
}
export default MovieSceneState;
