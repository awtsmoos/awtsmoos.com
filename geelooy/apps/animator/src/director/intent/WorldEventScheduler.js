// B"H
export class WorldEventScheduler {
  static build(arc = [], weather = []) {
    return arc.flatMap((beat, index) => {
      const at = beat.at ?? index * 2000;
      return [
        { at: at + 180, type: beat.emotion === 'fear' ? 'lightning' : 'rain_pulse', intensity: beat.emotion === 'fear' ? .95 : .45 },
        { at: at + 760, type: beat.emotion === 'victory' ? 'crowd_turns_to_light' : 'wind_gust', intensity: weather[index]?.wind || .5 }
      ];
    });
  }
}
