/** B"H — targeting finds the nearest other spark without cheating. */
export function nearest(me,fighters){ let best=null,d=Infinity; for(const f of fighters){ if(f===me||f.dead)continue; const nd=Math.abs(f.x-me.x)+Math.abs(f.y-me.y); if(nd<d){d=nd;best=f;} } return best; }
