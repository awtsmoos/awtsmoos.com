// B"H
export class CinematicCompositionSolver {
  static build(cameras = [], arc = []) {
    return cameras.map((camera, i) => ({
      cameraId: camera.id, at: camera.at,
      intent: arc[i]?.reason || camera.type,
      rule: this.rule(camera.type), negativeSpace: camera.type.includes('wide') || camera.type.includes('establishing'),
      leadingLine: camera.type.includes('object') ? 'puddleReflectionToLantern' : 'plazaCurveToFaces'
    }));
  }
  static rule(type = '') {
    if (type.includes('reaction')) return 'eyes_on_upper_third';
    if (type.includes('object')) return 'object_crosses_lower_third';
    if (type.includes('wide') || type.includes('establishing')) return 'tiny_cast_big_weather';
    return 'balanced_story_triangle';
  }
}
