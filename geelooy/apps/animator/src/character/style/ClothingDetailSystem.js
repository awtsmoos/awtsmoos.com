// B"H
export class ClothingDetailSystem { static apply(character = {}) { return { buttons: true, folds: character.styleProfile !== 'simple', cuffs: true }; } }
