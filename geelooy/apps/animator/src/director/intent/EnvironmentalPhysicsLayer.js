// B"H
export class EnvironmentalPhysicsLayer {
  static build(scene = {}, weather = [], light = []) {
    return weather.map((mark, index) => ({
      at: mark.at,
      puddleLevel: Math.min(1, .25 + index * .12),
      mudFootprints: index * 4,
      windVector: { x: Number((mark.wind || .4).toFixed(2)), y: .08 },
      lanternReflection: light[index]?.key || '#ffd978',
      clothDrag: Math.min(1, (mark.wind || .4) + .12),
      rainRippleDensity: Math.min(1, mark.rain || .5)
    }));
  }
}
