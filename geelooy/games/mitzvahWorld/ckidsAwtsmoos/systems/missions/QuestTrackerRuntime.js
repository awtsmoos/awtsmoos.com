// B"H
/**
 * QuestTrackerRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export function trackerRows(active={}){ return Object.values(active).map(m=>({id:m.id,title:m.title,progress:m.progress||0,total:m.objectives?.[0]?.count||1})); }
export default { trackerRows };
