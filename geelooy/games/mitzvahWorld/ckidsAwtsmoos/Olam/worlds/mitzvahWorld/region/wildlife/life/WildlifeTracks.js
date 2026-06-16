// B"H
/** @file WildlifeTracks.js @description Footprints, feathers, fur, droppings, scratches, and scent signs. */
import { dataOf, posOf, hash } from './LifeMath.js';
const SIGN = Object.freeze({ fox:'paw_print', rabbit:'tiny_tracks', deer:'hoof_print', goat:'hoof_scuff', frog:'wet_skip', bird:'feather' });
export function createTrack(actor, state = 'wander') { const data = dataOf(actor), p = posOf(actor), species = data.species || 'rabbit'; return { id:`track_${species}_${Date.now()}_${Math.floor(hash(p.x,p.z)*9999)}`, species, kind:SIGN[species] || 'track', state, x:p.x, y:p.y, z:p.z, strength:state === 'panic' || state === 'flee' ? 1 : .45, ttl:species === 'bird' ? 40 : 120 }; }
export function tickTracks(store, actors = [], dt = 1 / 60) { const tracks = store.tracks || []; actors.forEach(actor => { const d = dataOf(actor), m = d.motion || {}; m.trackTimer = (m.trackTimer || 0) - dt; if (m.trackTimer <= 0) { tracks.push(createTrack(actor, d.state || 'wander')); m.trackTimer = d.species === 'bird' ? 3.5 : .9; } }); for (let i = tracks.length - 1; i >= 0; i--) { tracks[i].ttl -= dt; if (tracks[i].ttl <= 0) tracks.splice(i, 1); } store.tracks = tracks.slice(-240); return store.tracks; }
export function trackSummary(store) { const tracks = store.tracks || []; return { tracks:tracks.length, fresh:tracks.filter(t => t.ttl > 80).length }; }
