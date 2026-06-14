// B"H
/**
 * @file AnimalAnimator.js
 * @description
 * Chapter 446: the animal body breathes while its parts speak.
 * Legs swing, ears twitch, tails flick, wings flap, heads raise, and every
 * species carries its own living rhythm without heavy skeletal machinery.
 */
const LEG_KEYS = ["leg_-1_-1_upper","leg_-1_1_upper","leg_1_-1_upper","leg_1_1_upper","leg_-1_-1_lower","leg_-1_1_lower","leg_1_-1_lower","leg_1_1_lower","foot_-1_-1","foot_-1_1","foot_1_-1","foot_1_1"];
function part(root, key) { return root?.userData?.parts?.[key] || null; }
function wave(t, phase = 0, speed = 1) { return Math.sin(t * speed + phase); }
function gaitScale(state) { return state?.includes("flee") || state === "hunt" ? 1.55 : state === "graze" || state === "hide" ? .42 : .9; }
function animateLegs(root, t, state) { const amp = .32 * gaitScale(state); LEG_KEYS.forEach((key, i) => { const p = part(root, key); if (!p) return; const fore = key.includes("_1_") ? 1 : -1; const side = key.includes("leg_1") || key.includes("foot_1") ? 1 : -1; p.rotation.x = wave(t, (fore * side > 0 ? 0 : Math.PI), 7.2) * amp; if (key.includes("lower") || key.includes("foot")) p.rotation.x *= -.55; }); }
function animateEars(root, t, species, state) { for (const s of [-1,1]) { const e = part(root, `ear_${s}`); if (!e) continue; e.rotation.z += wave(t, s * .7, species === "rabbit" ? 5.2 : 3.3) * .015; e.rotation.x = (state === "flee" || state === "fleePlayer" ? -.28 : 0) + wave(t, s, 2.2) * .045; } }
function animateTail(root, t, species, state) { const tail = part(root, "tail"); if (!tail) return; const fast = state === "hunt" || state === "flee" ? 5 : 2.4; tail.rotation.y = wave(t, 0, fast) * (species === "fox" ? .34 : .18); tail.rotation.x = Math.PI / 2 + wave(t, 1, fast * .7) * .1; const tip = part(root, "tail_tip"); if (tip) tip.position.x = wave(t, 2, fast) * .08; }
function animateHead(root, t, species, state) { const body = root.children.find(c => c.name === "solid_fur_textured_body_mesh"); if (body) body.rotation.x = wave(t, .4, 1.8) * .018; root.scale.y = 1 + wave(t, 0, 1.6) * .018; if (state === "graze") root.rotation.x = .05 + wave(t, 0, 1.1) * .025; else root.rotation.x = wave(t, 0, 1.4) * .015; if (species === "deer" && (state === "fleePlayer" || state === "patrol")) root.rotation.x -= .04; }
function animateWings(root, t, state) { for (const s of [-1,1]) { const w = part(root, `wing_${s}`); if (!w) continue; w.rotation.z = s * (.9 + Math.abs(wave(t, 0, state === "flock" ? 13 : 5)) * .75); } }
export function animateAnimal(root, dt = 1/60, state = "wander") {
  if (!root?.userData) return;
  const m = root.userData.motion || {}, species = root.userData.species || m.species || "rabbit";
  m.animTime = (m.animTime || 0) + Math.min(.08, Math.max(.001, Number(dt) || 1/60));
  const t = m.animTime + (m.phase || 0);
  animateLegs(root, t, state); animateEars(root, t, species, state); animateTail(root, t, species, state); animateHead(root, t, species, state); animateWings(root, t, state);
}
export default { animateAnimal };
