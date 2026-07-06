// B"H
import { normalizePlatformActionName, CANONICAL_ACTIONS } from "./MitzvahPlatformCatalog.js";

export function createRuntimeActionJournal(options = {}) {
  const events = [];
  const max = Math.max(32, Number(options.max || 240));
  return {
    record(name, payload = {}) {
      const action = normalizePlatformActionName(name);
      const row = {
        id:`act_${events.length + 1}`,
        action,
        source:name,
        group:CANONICAL_ACTIONS[action].group,
        at:payload.at || Date.now(),
        actorId:payload.actorId || "player",
        targetId:payload.targetId || payload.id || null,
        surfaces:CANONICAL_ACTIONS[action].reusable,
        payload:{ ...payload }
      };
      events.push(row);
      while (events.length > max) events.shift();
      return row;
    },
    snapshot() {
      return {
        schema:"mitzvah-runtime-action-journal-v1",
        count:events.length,
        tail:events.slice(-20),
        reusableSurfaces:["gameplay", "movie-maker", "replay", "studio", "ai-json"]
      };
    },
    events
  };
}

export default { createRuntimeActionJournal };
