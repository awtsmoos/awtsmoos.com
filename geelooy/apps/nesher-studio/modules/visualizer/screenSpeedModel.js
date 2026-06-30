/* B"H
Screen speed model: no recorder, no capture; existing stage/source motion becomes wind.
*/
export function deriveScreenSpeed(source, frame) {
  const runtime = source.visualizerRuntime ||= {}, now = snapshot(source, frame), prev = runtime.prevScreenSpeed || now;
  const motion = Math.hypot(now.x - prev.x, now.y - prev.y) + Math.abs(now.r - prev.r) * 3;
  const sizePulse = Math.abs(now.area - prev.area) / Math.max(1, now.area);
  const audioFallback = frame.level * .4 + frame.features?.treble * .2;
  const speed = clamp(motion / 80 + sizePulse * 4 + audioFallback);
  runtime.prevScreenSpeed = now;
  return { speed, direction:now.x >= prev.x ? 1 : -1, count:8 + Math.round(speed * 34), label:speedLabel(speed), energy:Math.max(speed, frame.level || 0) };
}
export function screenSpeedStreaks(source, frame) {
  const model = deriveScreenSpeed(source, frame), seed = frame.index || 0;
  return { ...model, streaks:Array.from({ length:model.count }, (_, i) => streak(source, model, seed, i)) };
}
function snapshot(source, frame) { return { x:Number(source.x || 0) + Math.sin(frame.t) * frame.level * 30, y:Number(source.y || 0), r:Number(source.rotation || 0), area:Number(source.w || 1) * Number(source.h || 1) }; }
function streak(source, model, seed, i) { return { x:(i * 53 + seed * 17) % Math.max(1, source.w), y:(i * 37 + seed * 11) % Math.max(1, source.h), len:18 + model.energy * 140 + (i % 5) * 9, alpha:.22 + model.energy * .62, direction:model.direction }; }
function speedLabel(speed) { return speed > .72 ? 'screen storm' : speed > .38 ? 'fast screen wind' : speed > .12 ? 'soft screen drift' : 'still canvas breath'; }
function clamp(value) { return Math.max(0, Math.min(1, Number(value || 0))); }
