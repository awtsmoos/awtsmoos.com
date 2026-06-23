// B"H
const PROFILES={fox:{neck:.72,shoulder:.9,hip:.78,rib:.62,jaw:.55},deer:{neck:1.15,shoulder:.86,hip:.92,rib:.7,jaw:.5},goat:{neck:.9,shoulder:.82,hip:.75,rib:.68,jaw:.58},cow:{neck:1.05,shoulder:1.15,hip:1.1,rib:.9,jaw:.7},rabbit:{neck:.42,shoulder:.55,hip:.85,rib:.52,jaw:.35},frog:{neck:.2,shoulder:.62,hip:.95,rib:.45,jaw:.8},bird:{neck:.65,shoulder:.5,hip:.45,rib:.38,jaw:.25}};
export function animalMuscleProfile(species="rabbit"){return{species,...(PROFILES[species]||PROFILES.rabbit)}}
export default animalMuscleProfile;
