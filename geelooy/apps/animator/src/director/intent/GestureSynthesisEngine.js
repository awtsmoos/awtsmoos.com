// B"H
const GESTURES = {
  doubt: ['protect_object', 'small_hand_check'], fear: ['freeze_shoulders', 'pull_object_close'],
  discovery: ['finger_pause', 'spark_follow'], resolve: ['hands_form_roof', 'weight_forward'],
  victory: ['open_palms', 'shared_laugh_release']
};

export class GestureSynthesisEngine {
  static build(characters = {}, arc = []) {
    return Object.fromEntries(Object.keys(characters).map(id => [id, this.track(id, arc)]));
  }
  static track(id, arc) {
    return arc.map((beat, index) => ({
      at: beat.at ?? index * 2000,
      gesture: this.gestureFor(id, beat.emotion),
      intensity: beat.emotion === 'victory' ? .9 : beat.emotion === 'fear' ? .74 : .55,
      reason: `${id}_expresses_${beat.emotion}_without_extra_dialogue`
    }));
  }
  static gestureFor(id, emotion) {
    if (id === 'goat_sidekick' && emotion === 'fear') return 'all_legs_lock';
    if (id === 'quiet_lamp_child' && emotion === 'resolve') return 'offer_paper_lamp';
    return (GESTURES[emotion] || GESTURES.resolve)[0];
  }
}
