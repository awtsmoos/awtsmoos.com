// B"H
import { animalMuscleProfile } from '../../systems/animals/AnimalMuscleProfiles.js';
import { animalFurPatternMasks } from '../../systems/animals/AnimalFurPatternMasks.js';
const deer=animalMuscleProfile('deer'); if(deer.neck<=1||deer.hip<=.8) throw new Error('Deer silhouette profile too weak');
if(!animalFurPatternMasks('fox').masks.includes('tail-tip')) throw new Error('Fox fur mask missing');
console.log('B"H animalHyperrealSilhouetteAudit passed');
