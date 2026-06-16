/** B"H — choose the nearest meaningful rival. */
export function chooseTarget(bot,fighters){return fighters.filter(f=>f!==bot&&!f.dead&&!f.hidden&&!f.respawnTimer).sort((a,b)=>score(bot,a)-score(bot,b))[0];}
function score(bot,f){return Math.abs(f.x-bot.x)+Math.abs(f.y-bot.y)*1.15+(f.human?-160:0)+((f.stun||0)>0?-80:0);}
