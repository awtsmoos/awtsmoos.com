// B”H
// House Generator - Building the dwellings of the Awtsmoos.

export class HouseGenerator {
  static generate(seed) {
    const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
    
    return {
      width: random(100, 300),
      height: random(100, 200),
      color: `hsl(${random(0, 360)}, 50%, 50%)`,
      roofType: random(0, 1) === 0 ? 'triangular' : 'flat',
      windows: random(1, 4),
      doorPosition: random(0, 1) === 0 ? 'left' : 'right'
    };
  }
}
