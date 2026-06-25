// B"H
/** HashgachaRuntime: meaningful coincidence chosen from actual shortage, reputation, and shefa. */
import { applyShefaAction } from '../shefa/ShefaRuntime.js';
function add(store,event){ store.eventFeed=[...(store.eventFeed||[]),event].slice(-80); store.hashgachaEvents=[...(store.hashgachaEvents||[]),event].slice(-40); return event; }
export function chooseHashgachaEvent(store={}, reason='tick'){ const bread=Number(store.economy?.bread||0), rep=Number(store.reputation?.village||0), shefa=Number(store.shefa?.malchus||0); if(bread<2) return { type:'traveler_brings_flour', reason, gift:{ flour:1 } }; if(rep>3||shefa>3) return { type:'neighbor_offers_help', reason, gift:{ charity:1 } }; return { type:'small_meaningful_delay', reason, gift:{} }; }
export function applyHashgacha(store={}, reason='tick'){ store.economy ||= {}; const event={ ...chooseHashgachaEvent(store,reason), at:Date.now() }; for(const [k,v] of Object.entries(event.gift||{})) store.economy[k]=(store.economy[k]||0)+v; applyShefaAction(store,'hospitality',1); return add(store,event); }
export function createHashgachaRuntime(store={}){ return { pulse:r=>applyHashgacha(store,r), choose:r=>chooseHashgachaEvent(store,r), events:()=>store.hashgachaEvents||[] }; }
export default { chooseHashgachaEvent, applyHashgacha, createHashgachaRuntime };
