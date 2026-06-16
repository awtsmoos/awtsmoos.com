// B"H
/** @file KingdomWorldClock.js @description Time becomes a gentle bounded river with parser-clear elapsed math. */
export function phaseAt(now, dayLengthMs) { const d = ((now % dayLengthMs) + dayLengthMs) % dayLengthMs, n = d / dayLengthMs; if (n < .25) return "morning"; if (n < .56) return "noon"; if (n < .78) return "evening"; return "night"; }
export function createKingdomWorldClock(now = Date.now(), dayLengthMs = 24 * 60 * 1000) { return { version:"kingdom-clock-v2-parser-clear", now, dayLengthMs, day:Math.floor(now / dayLengthMs), phase:phaseAt(now, dayLengthMs) }; }
export function advanceKingdomClock(clock, deltaMs = 1000) { const now = Math.max(0, Number(clock.now || 0) + Math.max(0, Number(deltaMs) || 0)); return createKingdomWorldClock(now, clock.dayLengthMs); }
export function kingdomElapsed(clock, later = Date.now()) { const start = clock && clock.now ? clock.now : 0; return Math.max(0, Number(later) - Number(start)); }
