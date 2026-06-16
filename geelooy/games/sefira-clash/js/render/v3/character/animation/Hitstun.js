/** B"H — hitstun delegates to reaction tiers. */
import { reaction } from './damage/Reactions.js';
export function hitstun(p,f,info={}){return reaction(p,f,info);}
