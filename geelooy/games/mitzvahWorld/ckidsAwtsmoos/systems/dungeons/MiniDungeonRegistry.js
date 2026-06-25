// B"H
/**
 * MiniDungeonRegistry
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export const MINI_DUNGEONS=Object.freeze([{id:'hidden_courtyard',title:'Hidden Courtyard',minutes:5,boss:'restless_spark',teaches:['interrupt','heal','avoid'] }]);
export const getMiniDungeon=id=>MINI_DUNGEONS.find(d=>d.id===id)||null;
export default { MINI_DUNGEONS, getMiniDungeon };
