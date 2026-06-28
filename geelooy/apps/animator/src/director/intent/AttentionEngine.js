// B"H
export class AttentionEngine {
  static build(characters = {}, arc = []) {
    return Object.fromEntries(Object.keys(characters).map(id => [id, this.track(id, arc)]));
  }
  static track(id, arc) {
    return arc.flatMap((beat, index) => {
      const at = beat.at ?? index * 2000;
      return [
        { at, eyes: beat.object || 'storm_lantern', head: beat.look || 'ensemble', torso: 'storm_lantern', hands: id === 'goat_sidekick' ? 'wrong_cord' : 'protect_light' },
        { at: at + 480, eyes: id === 'quiet_lamp_child' ? 'maker_face' : 'puddleGlow', head: beat.object || 'storm_lantern', torso: 'wind_pressure', hands: 'micro_adjust' }
      ];
    });
  }
}
