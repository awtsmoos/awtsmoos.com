// B"H
export class FoodObjectGrammar { static verb(food = 'apple', verb = 'show') { return `${food}:${verb}`; } static edible(type) { return ['apple', 'carrot', 'sandwich'].includes(type); } }
