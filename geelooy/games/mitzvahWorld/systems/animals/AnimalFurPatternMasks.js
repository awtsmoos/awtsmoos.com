// B"H
const MASKS={fox:["white-chest","dark-socks","tail-tip","muzzle"],deer:["dorsal-line","underbelly","soft-spots"],goat:["beard","knee-darkening","ear-tint"],cow:["large-patches","muzzle-wetness","hoof-darkening"],rabbit:["underbelly","ear-gradient","tail-puff"],frog:["back-speckles","wet-belly","eye-ridge"],bird:["wing-bars","head-cap","breast-gradient"]};
export function animalFurPatternMasks(species="rabbit"){return{species,masks:MASKS[species]||MASKS.rabbit,materialChannels:["color","roughness","normal-flow"]}}
export default animalFurPatternMasks;
