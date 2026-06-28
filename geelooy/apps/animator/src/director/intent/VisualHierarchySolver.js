// B"H
export class VisualHierarchySolver {
  static build(scene = {}, arc = []) {
    return arc.map((beat, index) => ({
      at: beat.at ?? index * 2000,
      primary: beat.object || 'storm_lantern',
      secondary: beat.look || 'storm_lantern_maker',
      tertiary: beat.emotion === 'victory' ? 'glowing_rain' : 'storm_sky',
      contrastPlan: beat.emotion === 'fear' ? 'silhouette_against_lightning' : 'warm_light_against_cool_rain',
      readability: 'primary_then_face_then_weather'
    }));
  }
}
