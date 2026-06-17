// B"H
export function animalNeeds(animal = {}) { return { hunger:animal.needs?.hunger ?? .35, thirst:animal.needs?.thirst ?? .25, fear:animal.needs?.fear ?? .1, rest:animal.needs?.rest ?? .2 }; }
