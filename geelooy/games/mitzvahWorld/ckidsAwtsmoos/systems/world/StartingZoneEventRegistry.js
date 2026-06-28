// B"H
/**
 * @file StartingZoneEventRegistry.js
 * @description
 * Passive starter-zone event data owned by StarterExperienceBootstrap.
 * No timers, no loops, no new features: just the existing small event list made
 * honest and inspectable.
 */
export const STARTING_ZONE_EVENT_OWNER = Object.freeze({
  owner:'StarterExperienceBootstrap',
  path:'ckidsAwtsmoos/systems/tutorial/StarterExperienceBootstrap.js',
  role:'starter-zone-catalog-events',
  startsLoop:false,
  writesPersistence:false
});

export const STARTING_ZONE_EVENTS = Object.freeze([
  Object.freeze({ id:'market_bell', at:'morning', text:'The market opens.' }),
  Object.freeze({ id:'learning_hour', at:'afternoon', text:'Children gather near the study house.' }),
  Object.freeze({ id:'lamp_lighting', at:'evening', text:'Warm lamps glow around the square.' })
]);

export function starterZoneEventsCatalog() {
  return Object.freeze({ owner:STARTING_ZONE_EVENT_OWNER, events:STARTING_ZONE_EVENTS });
}

export default STARTING_ZONE_EVENTS;
