// B"H
/** Maps story intents to runtime animation names without binding to any renderer. */
const MAP = Object.freeze({ idle:"Idle", walk:"Walk", run:"Run", talk:"Talk", teach_torah:"Teach", learn:"Study", wave:"Wave", celebrate:"Celebrate", camera_pose:"Idle" });
export function animationForIntent(intent = "idle") { return MAP[intent] || String(intent || "Idle"); }
export function normalizeAnimationIntent(entry = {}) {
  const intent = typeof entry === "string" ? entry : entry.intent || entry.animation || "idle";
  return { intent, animation:animationForIntent(intent), target:entry.target || null, duration:entry.duration || 1.2 };
}
export function normalizeAnimationTimeline(items = []) { return items.map(normalizeAnimationIntent); }
