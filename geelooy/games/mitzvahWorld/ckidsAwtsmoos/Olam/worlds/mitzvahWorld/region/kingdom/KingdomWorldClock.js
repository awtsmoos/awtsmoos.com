// B"H
/** @file KingdomWorldClock.js @description Time drives Shabbos prep, weather, learning, schedules. */
export function phaseAt(now, dayLengthMs){ const d=((now%dayLengthMs)+dayLengthMs)%dayLengthMs,n=d/dayLengthMs; if(n<.25)return"morning"; if(n<.56)return"noon"; if(n<.78)return"evening"; return"night"; }
export function createKingdomWorldClock(now=Date.now(),dayLengthMs=24*60*1000){ const day=Math.floor(now/dayLengthMs), phase=phaseAt(now,dayLengthMs), dayOfWeek=day%7; return { version:"kingdom-clock-v3-community-time", now, dayLengthMs, day, dayOfWeek, phase, shabbosPrep:dayOfWeek===5&&phase!=="night", shabbos:dayOfWeek===6 }; }
export function advanceKingdomClock(clock,deltaMs=1000){ return createKingdomWorldClock(Math.max(0,Number(clock.now||0)+Math.max(0,Number(deltaMs)||0)), clock.dayLengthMs); }
export function kingdomElapsed(clock,later=Date.now()){ return Math.max(0,Number(later)-Number(clock?.now||0)); }
export default { phaseAt, createKingdomWorldClock, advanceKingdomClock, kingdomElapsed };
