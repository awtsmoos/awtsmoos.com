// B"H
/** AnimalPredatorNetwork: ecology creates stories before combat. */
export const PREDATOR_PREY=Object.freeze({fox:['rabbit','bird'],wolf:['deer','sheep','goat'],bear:['fish','goat'],human:['livestock']});
export function predatorFor(species){return Object.entries(PREDATOR_PREY).filter(([,prey])=>prey.includes(species)).map(([p])=>p);}
export function preyFor(predator){return PREDATOR_PREY[predator]||[];}
export function encounter(predator,prey,context={}){const pressure=(context.hunger||.5)+(context.drought?.2:0)-(context.villageProtection?.3:0);return{predator,prey,risk:Math.max(0,Math.min(1,pressure)),storySeed:pressure>.65?'predator_investigation':'animal_tracks'};}
export class AnimalPredatorNetwork{constructor(){this.links=[];}link(predator,prey,kind='predator',detail={}){const row={predator,prey,kind,detail,at:Date.now()};this.links.push(row);return row;}summary(){return{links:this.links.length,predators:[...new Set(this.links.map(l=>l.predator))],prey:[...new Set(this.links.map(l=>l.prey))]};}}
export default AnimalPredatorNetwork;
