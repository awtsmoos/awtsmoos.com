// B"H
/**
 * @file LandmarkRegistry.js
 * @description
 * Passive starter landmark data owned by StarterExperienceBootstrap.
 * The Awtsmoos gives every place a name, but the bootstrap owns when that name
 * becomes visible to the player.
 */
export const LANDMARK_REGISTRY_OWNER = Object.freeze({
  owner:'StarterExperienceBootstrap',
  path:'ckidsAwtsmoos/systems/tutorial/StarterExperienceBootstrap.js',
  role:'starter-zone-catalog-landmarks',
  startsLoop:false,
  writesPersistence:false
});

export const LANDMARKS = Object.freeze([
  Object.freeze({ id:'study_house', title:'Study House' }),
  Object.freeze({ id:'village_inn', title:'Village Inn' }),
  Object.freeze({ id:'hidden_courtyard', title:'Hidden Courtyard' })
]);

export function landmarkCatalog() {
  return Object.freeze({ owner:LANDMARK_REGISTRY_OWNER, landmarks:LANDMARKS });
}

export default LANDMARKS;
