import { platformLanding } from '../core/collision.js';
/** B"H — platforms are firm utterances under falling feet. */
export function resolvePlatforms(f,map){ f.grounded=false; for(const p of map.platforms){ if(platformLanding(f,p)){f.y=p.y;f.vy=0;f.grounded=true;} } }
