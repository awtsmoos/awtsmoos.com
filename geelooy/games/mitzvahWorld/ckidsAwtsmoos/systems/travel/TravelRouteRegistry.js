// B"H
/**
 * TravelRouteRegistry
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export const TRAVEL_ROUTES = Object.freeze([
  { id:'village_to_orchard', from:'village_square', to:'orchard_gate', cost:0, unlock:'wake' },
  { id:'village_to_hidden_cave', from:'village_square', to:'hidden_cave_entrance', cost:1, unlock:'first_danger' },
  { id:'village_to_fields', from:'village_square', to:'starter_fields', cost:0, unlock:'first_profession' }
]);
export const getTravelRoute=id=>TRAVEL_ROUTES.find(r=>r.id===id)||null;
export default { TRAVEL_ROUTES, getTravelRoute };
