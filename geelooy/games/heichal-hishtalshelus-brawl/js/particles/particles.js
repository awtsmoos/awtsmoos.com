/** B"H — particles are tiny sparks confessing that impact happened. */
export function addEventParticles(state){ for(const e of state.events){ if(e.type==='hit'||e.type==='pickup'){ for(let i=0;i<12;i++)state.particles.push({x:e.x,y:e.y,vx:Math.cos(i)*Math.random()*4,vy:Math.sin(i)*Math.random()*4,life:28,color:e.color}); } } state.events.length=0; }
export function stepParticles(state){ for(const p of state.particles){p.x+=p.vx;p.y+=p.vy;p.vy+=.08;p.life--;} state.particles=state.particles.filter(p=>p.life>0); }
