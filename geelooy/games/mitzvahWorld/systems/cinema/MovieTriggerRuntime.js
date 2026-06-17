// B"H
/** Maps world events into cutscene play requests. */
export class MovieTriggerRuntime {
  constructor(bindings = {}) { this.bindings = { ...bindings }; }
  bind(eventType, cutsceneId) { this.bindings[eventType] = cutsceneId; return { eventType, cutsceneId }; }
  resolve(eventType) { return this.bindings[eventType] || null; }
  snapshot() { return { bindings:{ ...this.bindings } }; }
}
export default MovieTriggerRuntime;
