// B"H
/** @file AnimalDailyNeeds.js @description Needs drift so animals seek food, water, sleep, herd, nutrition, and safety. */
function clamp(v,min=0,max=1){ return Math.max(min,Math.min(max,v)); }
export function animalDailyNeeds(spec={}){ return { hunger:spec.hunger??.35, thirst:spec.thirst??.3, sleep:spec.sleep??.25, social:spec.social??.45, safety:spec.threat?.9:.15, health:spec.health??1, nutrition:spec.nutrition??.5, bodyCondition:spec.bodyCondition??.5 }; }
export function tickAnimalNeeds(needs,dt=1){ return { hunger:clamp(needs.hunger+dt*.015), thirst:clamp(needs.thirst+dt*.02), sleep:clamp(needs.sleep+dt*.01), social:clamp(needs.social+dt*.005), safety:clamp(needs.safety-dt*.01), health:needs.health, nutrition:clamp((needs.nutrition??.5)-dt*.006), bodyCondition:clamp((needs.bodyCondition??.5)+((needs.nutrition??.5)-.5)*dt*.01) }; }
export default animalDailyNeeds;
