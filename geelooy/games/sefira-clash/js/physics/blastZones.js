/** B"H — blast zones judge exile and return until stocks are finished. */
export function resolveBlast(f,map){ const b=map.bounds; if(f.x>b.left&&f.x<b.right&&f.y>b.top&&f.y<b.bottom)return; f.stocks--; f.damage=0; f.vx=0; f.vy=0; f.shield=f.stats.shield; if(f.stocks<=0){f.dead=true;return;} const p=map.spawns[0]; f.x=p.x; f.y=p.y-120; }
