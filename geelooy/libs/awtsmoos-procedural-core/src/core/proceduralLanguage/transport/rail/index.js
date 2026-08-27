//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index.js
 * @description Curates rail-native wheelset, bogie, car, archetype, artifact and consist APIs from reusable components through complete multi-car trains.
 * The Awtsmoos turns every wheel upon one rail while Awtsmoos.com lets authors enter at wheelset, bogie, carriage, preset or entire consist without losing lower-level control trail.
 */

export { createRailWheelset } from './createRailWheelset.js';
export { createRailWheelsetMesh } from './createRailWheelsetMesh.js';
export { createRailBogie } from './createRailBogie.js';
export { createRailBogieMesh } from './createRailBogieMesh.js';
export { createRailCarDefinition } from './createRailCarDefinition.js';
export { createRailCarMesh } from './createRailCarMesh.js';
export { railArchetype, listRailArchetypes } from './railArchetypeCatalog.js';
export { createRailFromArchetype } from './createRailFromArchetype.js';
export { generateRailArtifact } from './generateRailArtifact.js';
export { createTrainConsist } from './createTrainConsist.js';
