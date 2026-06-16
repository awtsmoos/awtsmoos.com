// B"H
/** @file GrassDisturbanceSystem.js @description Moving creatures bend grass and leave temporary trails. */
import { dataOf, posOf } from './LifeMath.js';
export function disturbGrass(store, actors = [], dt = 1 / 60) { const list = store.grassDisturbances || []; actors.forEach(actor => { const data = dataOf(actor), motion = data.motion || {}, p = posOf(actor), moving = Math.abs(motion.vx || 0) + Math.abs(motion.vz || 0) > .08; if (!moving) return; list.push({ x:p.x, z:p.z, radius:data.species === 'deer' ? 1.8 : data.species === 'goat' ? 1.4 : .9, strength:data.state === 'panic' || data.state === 'flee' ? 1 : .45, ttl:4.5 }); }); for (let i = list.length - 1; i >= 0; i--) { list[i].ttl -= dt; if (list[i].ttl <= 0) list.splice(i, 1); } store.grassDisturbances = list.slice(-160); return store.grassDisturbances; }
export function grassSummary(store) { const g = store.grassDisturbances || []; return { grassDisturbances:g.length, strong:g.filter(x => x.strength > .8).length }; }
