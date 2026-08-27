// B"H
export class FoodShapeLibrary {
  static style(type = 'apple') { return { apple: { fill: '#df3e35', stroke: '#4b120f' }, carrot: { fill: '#f28c28', stroke: '#5a2b10' }, sandwich: { fill: '#f0c36a', stroke: '#5d3518' } }[type] || { fill: '#ffd45a', stroke: '#442' }; }
}
