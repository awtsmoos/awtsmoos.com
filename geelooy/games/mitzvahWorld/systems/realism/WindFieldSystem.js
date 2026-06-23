// B"H
export function windFieldAt({time=0,weather='clear',x=0,z=0}={}){const storm=weather==='storm'?2:weather==='rain'?1.35:1;const base=Math.sin(time*.0002+x*.01)+Math.cos(time*.00017+z*.013);const speed=Math.max(.05,(.45+Math.abs(base)*.55)*storm);return{speed,direction:{x:Math.cos(base),z:Math.sin(base)},gust:Math.max(0,Math.sin(time*.001+x*.03+z*.02))*storm,vegetationSway:speed*.7,particleDrift:speed*.45,audioWhoosh:weather==='storm'?speed:.15*speed}}
export default windFieldAt;
