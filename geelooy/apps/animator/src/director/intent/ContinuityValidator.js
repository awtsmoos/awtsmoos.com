// B"H
export class ContinuityValidator {
  static audit(scene = {}, plan = {}) {
    const cameras = scene.cameras || [], arc = plan.storyArc || [];
    const checks = {
      ascendingCameras: cameras.every((cam, i) => i === 0 || cam.at >= cameras[i - 1].at),
      arcInsideDuration: arc.every(mark => mark.at >= 0 && mark.at <= scene.duration),
      eyeTracksForCast: Object.keys(plan.eyeContact || {}).length === Object.keys(scene.initialCharacters || {}).length,
      propStateForProps: Object.keys(plan.propStates || {}).length === (scene.initialProps || []).length,
      planReadyBeforeDashboard: Boolean(plan.storyArc && plan.relationships && plan.composition),
      silenceBeatsExist: (plan.silenceBeats || []).length === arc.length,
      environmentalMemoryExists: (plan.environmentalMemory || []).length === arc.length
    };
    const missing = Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => key);
    return { ok: missing.length === 0, missing, checks, score: Math.round(Object.values(checks).filter(Boolean).length / Object.keys(checks).length * 100) };
  }
}
