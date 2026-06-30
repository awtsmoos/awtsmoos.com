// B"H
import { cinematicPacket } from "./packets/CinematicPacket.js";

export function routeConsequenceBeat(beat = {}) {
  const p = beat.payload || beat;
  const consequences = p.consequences || p.events || [p].filter(x => x.type || x.key);
  return cinematicPacket("consequence", beat.id || p.id || "consequence", beat.at || p.at || 0, 0, {
    consequences,
    questId:p.questId || p.id || null,
    flag:p.flag || p.key || null
  });
}

export default routeConsequenceBeat;
