// B"H
/**
 * FactionRegistry
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export const FACTIONS=Object.freeze([{id:'village',title:'The Village',levels:[0,25,75,150],rewards:['greeting','discount','special_recipe','trusted_helper']}]);
export const getFaction=id=>FACTIONS.find(f=>f.id===id)||FACTIONS[0];
export default { FACTIONS, getFaction };
