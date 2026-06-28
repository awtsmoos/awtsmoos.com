// B"H
export class DirectorQA {
  static audit(scene = {}, plan = {}) {
    const checks = {
      readableFocus: (plan.visualHierarchy || []).every(mark => mark.primary && mark.secondary),
      reactiveWorld: (plan.environmentalPhysics || []).length === (plan.weatherNarrative || []).length,
      liveCamera: (plan.liveCamera || []).length === (scene.cameras || []).length,
      facialTracks: Object.keys(plan.facialPerformance || {}).length === Object.keys(scene.initialCharacters || {}).length,
      proceduralActing: Object.keys(plan.proceduralActing || {}).length === Object.keys(scene.initialCharacters || {}).length,
      scheduledEvents: (plan.worldEvents || []).length >= (plan.storyArc || []).length * 2,
      brainReady: plan.directorBrain?.ok === true
    };
    const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => key);
    return { ok: failed.length === 0, failed, checks, score: Math.round(Object.values(checks).filter(Boolean).length / Object.keys(checks).length * 100), recommendation: failed.length ? 'repair_before_render' : 'render_reactive_scene' };
  }
}
