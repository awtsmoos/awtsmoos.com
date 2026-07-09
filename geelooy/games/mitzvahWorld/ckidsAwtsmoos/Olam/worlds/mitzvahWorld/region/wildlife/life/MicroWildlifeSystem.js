// B"H
/** @file MicroWildlifeSystem.js @description Butterflies, bees, dragonflies, fireflies: small life with huge feeling. */
import { hash } from './LifeMath.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
const TYPES = ['butterfly','bee','dragonfly','firefly'];
export function seedMicroWildlife(count = 70) { const out = []; for (let i = 0; i < count; i++) { const type = TYPES[i % TYPES.length]; out.push({ id:`micro_${type}_${i}`, type, x:(hash(i,1)-.5)*360, z:(hash(i,2)-.5)*180, y:type === 'dragonfly' ? 1.6 : type === 'firefly' ? .9 : .7, phase:hash(i,3)*6.28 }); } return out; }
export function tickMicroWildlife(store, dt = 1 / 60) { if (!store.microWildlife) store.microWildlife = seedMicroWildlife(); store.microWildlife.forEach(m => { m.phase += dt * (m.type === 'dragonfly' ? 3.2 : 1.4); m.x += Math.sin(m.phase) * dt * .8; m.z += Math.cos(m.phase * .7) * dt * .55; m.glow = m.type === 'firefly' ? Math.max(0, Math.sin(m.phase * 2.1)) : 0; }); return store.microWildlife; }
export function microSummary(store) { const m = store.microWildlife || []; return { microWildlife:m.length, fireflies:m.filter(x => x.type === 'firefly').length }; }
