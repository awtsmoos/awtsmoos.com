// B"H
export class CrowdBehaviorDirector {
  static build(arc = []) {
    const extras = ['awning_vendor', 'roof_watcher', 'banner_child', 'distant_musician', 'rain_runner', 'lamp_neighbor'];
    return Object.fromEntries(extras.map((id, index) => [id, this.track(id, index, arc)]));
  }
  static track(id, index, arc) {
    return arc.map((beat, beatIndex) => ({
      at: beat.at ?? beatIndex * 2000,
      goal: beat.emotion === 'fear' ? 'seek_shelter' : beat.emotion === 'victory' ? 'turn_toward_light' : 'watch_lantern',
      awareness: Math.min(1, .3 + beatIndex * .12),
      weatherReaction: index % 2 ? 'shield_face_from_rain' : 'hold_awning_rope',
      attention: beat.object || 'storm_lantern'
    }));
  }
}
