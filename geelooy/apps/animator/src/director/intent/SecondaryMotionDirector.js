// B"H
export class SecondaryMotionDirector {
  static build(characters = {}, props = [], weather = []) {
    return {
      characters: Object.fromEntries(Object.keys(characters).map(id => [id, weather.map((mark, i) => ({ at: mark.at, scarf: mark.wind, hair: mark.wind * .7, coat: mark.rain, delay: .08 + i * .01 }))])),
      props: Object.fromEntries(props.map(prop => [prop.id, weather.map(mark => ({ at: mark.at, sway: prop.wind ? mark.wind : mark.wind * .25, wetness: mark.rain, glowDrag: prop.glow ? .4 : 0 }))]))
    };
  }
}
