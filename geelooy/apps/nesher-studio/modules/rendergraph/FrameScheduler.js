/* B"H
The scheduler ticks only when asked in tests or started in browser runtime.
It measures drops without pretending CPU prophecy.
*/
export function createFrameScheduler(input = {}) {
  return { kind:'FrameScheduler', fps:input.fps || 30, running:false, timer:null, tick:input.tick || (() => {}) };
}
export function startFrameScheduler(s) { if (s.running) return s; s.running = true; s.timer = setInterval(() => s.tick(), Math.max(1, 1000 / s.fps)); return s; }
export function stopFrameScheduler(s) { clearInterval(s.timer); s.timer = null; s.running = false; return s; }
export function stepFrameScheduler(s, count = 1) { for (let i = 0; i < count; i++) s.tick(); return s; }
