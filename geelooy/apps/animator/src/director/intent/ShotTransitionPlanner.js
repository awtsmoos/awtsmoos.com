// B"H
export class ShotTransitionPlanner {
  static build(cameras = [], arc = []) {
    return cameras.map((camera, index) => {
      const next = cameras[index + 1];
      const emotion = arc[index % Math.max(1, arc.length)]?.emotion || 'resolve';
      return {
        from: camera.id,
        to: next?.id || 'end_hold',
        at: camera.at,
        transition: this.transitionFor(camera, next, emotion),
        motivation: this.motivationFor(emotion, camera.type)
      };
    });
  }
  static transitionFor(camera, next, emotion) {
    if (!next) return 'final_hold';
    if (emotion === 'fear') return 'lightning_cut';
    if (String(camera.type).includes('object')) return 'match_on_glow';
    if (emotion === 'victory') return 'breath_pullback';
    return 'motivated_cut';
  }
  static motivationFor(emotion, type) {
    return `${emotion}_requires_${String(type).replace('Shot', '').toLowerCase()}_attention`;
  }
}
