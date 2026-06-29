// B"H
/**
 * @file InteractiveNpcAnimation.js
 * @description
 * Idle breath and fallback visual motion. The Awtsmoos makes even stillness
 * move with a hidden pulse.
 */
export function preferredStandingClip(npc) {
  const clips = npc.animations || [];
  return clips.find(animation => (
    /stand|idle|breath|rest/i.test(animation.name)
    && !/dance|walk|run/i.test(animation.name)
  )) || clips.find(animation => !/dance|jump|fall|attack/i.test(animation.name)) || clips[0] || null;
}

export function setStandingPose(npc, force = false) {
  const clip = preferredStandingClip(npc);
  if (!npc.animationMixer || !clip) return;

  const name = clip.name;
  if (!force && npc.__standingClipName === name) return;

  npc.__standingClipName = name;
  npc.playChaweeyoos?.(name, {
    duration: 0.1,
    loop: true,
    force,
    timeScale: 0.68
  });
  npc.animationMixer.update(0);
}

export function tickFallbackVisual(npc, delta = 1 / 60) {
  if (!npc.guideVisualMesh) return;

  const now = (globalThis.performance?.now?.() || Date.now()) * 0.001;
  npc.guideVisualMesh.position.y = Math.sin(now * 1.7) * 0.025;
  npc.guideVisualMesh.rotation.y += Math.sin(now * 0.83) * 0.0009 * Math.min(3, delta * 60);
}

export function tickNpcAnimation(npc, delta = 1 / 60) {
  const dt = Math.min(0.05, Math.max(0.001, Number(delta) || 1 / 60));
  npc.__lastNpcAnimationTick += dt;

  if (npc.__lastNpcAnimationTick >= 1 / 30) {
    npc.animationMixer?.update?.(npc.__lastNpcAnimationTick);
    npc.__lastNpcAnimationTick = 0;
  }

  tickFallbackVisual(npc, dt);
}
