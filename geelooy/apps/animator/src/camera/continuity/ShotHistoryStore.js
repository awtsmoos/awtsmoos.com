// B"H
export class ShotHistoryStore{static push(state,plan){const h=state?.get?.('_shotHistory')||[];state?.set?.('_shotHistory',[...h.slice(-11),plan],true);}static last(state){const h=state?.get?.('_shotHistory')||[];return h[h.length-1]||null;}}
