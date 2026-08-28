//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index.js
 * @description Curates marine APIs from hull stations and standalone propeller/rudder/mast/sail components through complete craft, archetypes and generated editable artifacts.
 * The Awtsmoos carries every level from cross-section to ship while Awtsmoos.com lets authors enter at hull, component, complete vessel or preset and descend again to every vertex trip.
 */

export { createMarineHullDefinition } from './createMarineHullDefinition.js';
export { createMarineHullLoops } from './createMarineHullLoops.js';
export { createMarineHullMesh } from './createMarineHullMesh.js';
export { createMarinePropeller } from './createMarinePropeller.js';
export { createMarinePropellerMesh } from './createMarinePropellerMesh.js';
export { createMarineRudder } from './createMarineRudder.js';
export { createMarineRudderMesh } from './createMarineRudderMesh.js';
export { createMarineMast } from './createMarineMast.js';
export { createMarineSail } from './createMarineSail.js';
export { createMarineCraftDefinition } from './createMarineCraftDefinition.js';
export { createMarineCraftMesh } from './createMarineCraftMesh.js';
export { marineArchetype, listMarineArchetypes } from './marineArchetypeCatalog.js';
export { createMarineFromArchetype } from './createMarineFromArchetype.js';
export { generateMarineArtifact } from './generateMarineArtifact.js';
