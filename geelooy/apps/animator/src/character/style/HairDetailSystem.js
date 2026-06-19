// B"H
export class HairDetailSystem { static apply(character = {}) { return { strands: character.expressionProfile === 'bright_child' ? 5 : 4, shine: true }; } }
