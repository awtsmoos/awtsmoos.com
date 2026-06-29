// B"H
export class DirectorBrain {
  static audit(scene = {}, plan = {}) {
    const checks = {
      hasAttention: Object.keys(plan.attention || {}).length === Object.keys(scene.initialCharacters || {}).length,
      hasMotivation: Object.keys(plan.motivation || {}).length === Object.keys(scene.initialCharacters || {}).length,
      hasMicroExpressions: Object.values(plan.microExpressions || {}).every(track => track.length >= 12),
      hasSecondaryMotion: Boolean(plan.secondaryMotion?.characters && plan.secondaryMotion?.props),
      hasHierarchy: (plan.visualHierarchy || []).length === (plan.storyArc || []).length,
      hasColorScript: (plan.emotionalColorScript || []).length === (plan.storyArc || []).length,
      hasStateMachine: plan.sceneState?.final === 'shared_light_survives'
    };
    const fixes = Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => `repair_${key}`);
    return { ok: fixes.length === 0, checks, fixes, decision: fixes.length ? 'revise_before_render' : 'renderable_with_living_direction' };
  }
}
