// B"H
const BASE = ['protect_lantern', 'survive_weather', 'connect_with_ensemble'];
export class MotivationGraph {
  static build(characters = {}, arc = []) {
    return Object.fromEntries(Object.keys(characters).map(id => [id, this.motivations(id, arc)]));
  }
  static motivations(id, arc) {
    return arc.map((beat, index) => ({
      at: beat.at ?? index * 2000,
      primary: this.primary(id, beat.emotion),
      competing: id === 'festival_captain' ? ['save_schedule', ...BASE] : BASE,
      pressure: beat.emotion === 'fear' ? .92 : beat.emotion === 'victory' ? .28 : .55
    }));
  }
  static primary(id, emotion) {
    if (id === 'goat_sidekick') return emotion === 'fear' ? 'freeze_then_help' : 'find_food_like_courage';
    if (id === 'quiet_lamp_child') return 'offer_silent_hope';
    return emotion === 'resolve' ? 'protect_shared_light' : 'understand_storm';
  }
}
