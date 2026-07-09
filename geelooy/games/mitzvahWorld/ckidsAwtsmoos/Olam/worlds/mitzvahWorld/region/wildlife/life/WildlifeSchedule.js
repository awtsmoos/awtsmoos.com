// B"H
/** @file WildlifeSchedule.js @description Day-night life schedules by species. */
import { timePhase } from './LifeMath.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
const TABLE = Object.freeze({ fox:{ morning:'returnDen', day:'restDen', evening:'hunt', night:'hunt' }, rabbit:{ morning:'graze', day:'hide', evening:'graze', night:'hide' }, deer:{ morning:'grazeHerd', day:'shadeHerd', evening:'grazeHerd', night:'restHerd' }, goat:{ morning:'climbGraze', day:'climbRest', evening:'graze', night:'sleep' }, frog:{ morning:'waterRest', day:'waterRest', evening:'croak', night:'huntInsects' }, bird:{ morning:'flockFeed', day:'circlePerch', evening:'returnNest', night:'sleepNest' } });
export function scheduleFor(species, dayTime) { const phase = timePhase(dayTime); const table = TABLE[species] || TABLE.rabbit; return { phase, activity:table[phase] || 'wander' }; }
export function worldDayTime(olam) { const t = olam && olam.clock && olam.clock.now ? olam.clock.now : Date.now(); return (t % 240000) / 240000; }
