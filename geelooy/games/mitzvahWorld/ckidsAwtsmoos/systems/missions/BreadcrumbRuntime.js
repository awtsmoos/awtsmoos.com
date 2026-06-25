// B"H
/**
 * BreadcrumbRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export function breadcrumbForMission(mission){ return mission?{text:mission.title,target:mission.objectives?.[0]?.target||mission.giver}:null; }
export default { breadcrumbForMission };
