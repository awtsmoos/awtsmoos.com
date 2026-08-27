// B"H
export class SceneIntentScorer {
  static score(scene = {}, plan = {}) {
    const arc = plan.storyArc || [], cameras = scene.cameras || [];
    const metrics = {
      emotionalArc: arc.length >= 6,
      weatherStory: (plan.weatherNarrative || []).length === arc.length,
      silencePresent: (plan.silenceBeats || []).length >= 4,
      propMemory: Object.keys(plan.propStates || {}).length >= 10,
      compositionCoverage: (plan.composition || []).length === cameras.length,
      continuityClean: plan.continuity?.ok === true
    };
    const score = Math.round(Object.values(metrics).filter(Boolean).length / Object.keys(metrics).length * 100);
    return { score, metrics, label: score === 100 ? 'scene_intent_clear' : 'scene_intent_needs_attention' };
  }
}
