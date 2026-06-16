// B"H
/** @file CorpseRuntime.js @description Corpse marker payload for solo corpse-run UI. */
import { ensureDeathState } from "./DeathRuntime.js";
export function corpsePayload(olam) { const s = ensureDeathState(olam); return { hasCorpse:Boolean(s?.corpse), corpse:s?.corpse || null, ghost:Boolean(s?.ghost) }; }
export function emitCorpse(olam) { const payload = corpsePayload(olam); olam?.ayshPeula?.("ui event", "corpseMarker", payload); return payload; }
export default { corpsePayload, emitCorpse };
