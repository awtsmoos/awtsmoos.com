// B"H
export function attackStateFor(species = "fox") { return ({ fox:"pounce", goat:"charge", cow:"shove", deer:"flee_kick", bird:"fly_peck" }[species] || "attack"); }
