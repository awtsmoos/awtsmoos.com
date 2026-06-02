// B"H
/**
 * @file swarm-v2-template.cjs
 * @description
 * Chapter 12: The cave learned the shape of the human thumb.
 *
 * The earlier D-pad was swallowed by mobile browser chrome. This vessel makes
 * controls fixed above the safe area, adds canvas tap-zones/swipe, a modal
 * help sheet, ten richer levels, animated walking, critter pulses, particles,
 * a mini-map feeling through lighting, and auto-resizing layout.
 */

function swarmV2Html(agentLog = {}) {
  const notes = Object.entries(agentLog)
    .map(([role, text]) => `<h3>${escapeHtml(role)}</h3><pre>${escapeHtml(text)}</pre>`)
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>Crystal Critters: Thumb-Safe Swarm</title>
<style>
:root{--bg:#05020e;--panel:#14082dee;--cyan:#4cf4ff;--violet:#ad67ff;--pink:#ff4fa3;--gold:#ffd86b;--green:#5cffb2;--text:#fff8ff;--bottom:148px}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:radial-gradient(circle at 50% -10%,#241052 0,#0a041b 48%,#020108 100%);color:var(--text);font-family:Inter,system-ui,Arial,sans-serif;touch-action:manipulation;overscroll-behavior:none}body{padding-bottom:calc(var(--bottom) + env(safe-area-inset-bottom))}
main{width:min(1040px,100vw);margin:auto;padding:clamp(12px,3vw,24px)}.hero{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.brand{display:flex;gap:12px;align-items:center}.gem{font-size:clamp(2.3rem,9vw,4.8rem);filter:drop-shadow(0 0 18px var(--cyan))}h1{font-size:clamp(2rem,8vw,4.5rem);line-height:.95;margin:.1em 0}.sub{font-size:clamp(1rem,4vw,1.45rem);opacity:.88}.top-actions{display:flex;gap:8px;flex-wrap:wrap}.button{border:0;border-radius:999px;background:linear-gradient(180deg,#85fbff,#49c4ff);color:#05020e;font-weight:1000;padding:12px 16px;box-shadow:0 6px 0 #24708d}.button:active{transform:translateY(3px);box-shadow:0 3px 0 #24708d}.guide{font-size:clamp(1rem,4.2vw,1.5rem);line-height:1.25}.hud{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:9px;margin:12px 0}.pill{border:1px solid var(--cyan);border-radius:999px;padding:10px 8px;text-align:center;background:#1b0b3acc;font-weight:1000;box-shadow:inset 0 0 18px #4cf4ff11}.toast{min-height:34px;text-align:center;color:var(--gold);font-weight:1000;font-size:clamp(1rem,4vw,1.35rem)}.stage{position:relative;background:linear-gradient(180deg,#1b0a3caa,#05020ecc);border:1px solid #6b35ff77;border-radius:24px;padding:clamp(7px,2vw,14px);box-shadow:0 0 44px #7b38ff55}canvas{display:block;width:100%;max-height:calc(100svh - 330px);height:auto;min-height:260px;background:#03010a;border:2px solid var(--violet);border-radius:22px;box-shadow:0 0 34px #ad67ff88;touch-action:none}.tap-hint{position:absolute;right:18px;bottom:18px;background:#05020ecc;border:1px solid var(--cyan);border-radius:14px;padding:8px 10px;font-weight:900;opacity:.75}.dock{position:fixed;left:0;right:0;bottom:0;z-index:20;padding:10px 12px calc(10px + env(safe-area-inset-bottom));background:linear-gradient(180deg,transparent,#070313 18%,#070313);pointer-events:none}.controls{pointer-events:auto;margin:auto;display:grid;grid-template-columns:repeat(5,64px);gap:8px;justify-content:center;align-items:center}.controls button{height:58px;border:0;border-radius:20px;background:linear-gradient(180deg,#75f7ff,#36bdf0);color:#05020e;font-size:1.35rem;font-weight:1000;box-shadow:0 7px 0 #216b88}.controls button.big{grid-column:span 2}.controls button:active,.controls button.active{transform:translateY(4px);box-shadow:0 3px 0 #216b88;background:linear-gradient(180deg,#fff0a8,#4cf4ff)}.blank{visibility:hidden}.modal{position:fixed;inset:0;z-index:40;background:#03010acc;display:none;align-items:flex-end}.modal.open{display:flex}.sheet{width:100%;max-height:78svh;overflow:auto;background:#16082f;border:1px solid var(--cyan);border-radius:24px 24px 0 0;padding:20px;box-shadow:0 0 60px #4cf4ff55}.sheet h2{margin-top:0}.sheet li{margin:.55em 0}.notes{margin-top:16px;background:#120727;border-radius:18px;padding:12px}pre{white-space:pre-wrap;max-height:160px;overflow:auto;color:#f1e8ff}.flash{animation:flash .25s linear}@keyframes flash{50%{filter:brightness(2)}}@media(max-width:720px){:root{--bottom:142px}.hud{grid-template-columns:repeat(2,minmax(0,1fr))}.hud .wide{grid-column:span 2}.top-actions{width:100%}.button{flex:1}.controls{grid-template-columns:repeat(5,58px)}.controls button{height:54px;border-radius:18px}canvas{max-height:calc(100svh - 390px)}}@media(max-height:720px){.guide{display:none}canvas{max-height:calc(100svh - 300px)}.hud{margin:6px 0}.toast{min-height:24px}.controls button{height:48px}}
</style>
</head>
<body>
<main>
<section class="hero"><div class="brand"><div class="gem">💎</div><div><h1>Crystal Critters</h1><div class="sub">Thumb-Safe Swarm Edition</div></div></div><div class="top-actions"><button class="button" id="helpBtn">How to Play</button><button class="button" id="notesBtn">Agent Notes</button></div></section>
<p class="guide">Swipe directly on the cave, tap a side of the cave, or use the fixed D-pad. The buttons now float above mobile browser chrome.</p>
<section class="hud"><div class="pill" id="level">Level 1</div><div class="pill" id="score">0/0</div><div class="pill" id="lives">♥♥♥</div><div class="pill" id="timer">60s</div><div class="pill wide" id="combo">Combo x1</div></section>
<div class="toast" id="toast">B'H — tap How to Play if needed</div>
<section class="stage"><canvas id="game" width="800" height="520"></canvas><div class="tap-hint">swipe / tap cave</div></section>
<details class="notes" id="agentNotes"><summary>Swarm design notes</summary>${notes}</details>
</main>
<section class="dock"><div class="controls" aria-label="fixed mobile controls"><span class="blank"></span><button data-move="0,-1">▲</button><button id="wait">◆</button><button id="pause">Ⅱ</button><span class="blank"></span><button data-move="-1,0">◀</button><button class="big" id="restart">Restart</button><button data-move="1,0">▶</button><span class="blank"></span><span class="blank"></span><button data-move="0,1">▼</button><button class="big" id="next">Next</button><span class="blank"></span></div></section>
<section class="modal" id="helpModal"><div class="sheet"><h2>How to Play</h2><ul><li>Move: swipe on the cave, tap a cave edge, use D-pad, or use WASD/arrow keys.</li><li>Collect every ✦ crystal before the timer collapses.</li><li>Hearts restore lives. Critters hurt you and send you back to spawn.</li><li>Chain crystals quickly to increase combo.</li><li>Pause with Ⅱ. Restart restarts the current cave. Next skips for testing.</li></ul><button class="button" id="closeHelp">Close</button></div></section>
<script>
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const ui={level:id('level'),score:id('score'),lives:id('lives'),timer:id('timer'),combo:id('combo'),toast:id('toast')};function id(x){return document.getElementById(x)}
const TILE=40, EMO={p:['😊','🙂','😄','😎'],c:['☠️','👾'],x:'✦',h:'💖',g:'🌀'};let level=0,st,paused=false,last=performance.now(),walk=0,particles=[],shake=0,combo=1,lastCrystal=0;
const maps=[
['####################','#P....*.....#..h..*#','#.####.####.#.###..#','#....#....#...#....#','#.##.#.##.#####.##.#','#..#...#....*...#..#','##.#####.######.##.#','#..*......C.......*#','#.######.#######.###','#....*............E#','####################'],
['####################','#P.*.....#....*....#','#.#####..#.######..#','#...C....#......#..#','####.#######.##.#.##','#..h.#.....#..#....#','#.##.#.###.##.####.#','#..#...#....*...C..#','#.#######.########.#','#*...............E.#','####################'],
['####################','#P...*...C.....*...#','#.###.########.###.#','#...#....h.....#...#','#.#.###.####.###.#.#','#.#.....#..#.....#.#','#.#####.#..#.#####.#','#*......#..#.....*.#','#.########.#######.#','#....C.........E...#','####################'],
['####################','#P..*..#....*..#..h#','#.###..#.####..#.###','#...#..#....#..#...#','###.#.####C.#.####.#','#...#....#..#......#','#.#####.##..####.#.#','#*....#......#...#.#','#.##..######.#.###.#','#...C....*....E...*#','####################'],
['####################','#P...#...*...#....h#','#.##.#.#####.#.##..#','#..#.#...C...#..#..#','##.#.###.###.##.#.##','#..#.....#......#..#','#.######.#.######..#','#*.......#.....*..C#','#.###############..#','#....*.........E...#','####################'],
['####################','#P..h....*....C....#','#.####.#####.#####.#','#....#.....#.....#.#','####.###.#.###.#.#.#','#*......#.#....#...#','#.######.#.#########','#....C...#.....*...#','#.###########.###..#','#*.............E..*#','####################'],
['####################','#P.*..#.....*.....h#','#.##..#.##########.#','#..#..#......C.....#','##.##.######.#####.#','#......*..#....#...#','#.#########.##.#.###','#C.....#....##.#...#','#.###..#.#####.###.#','#...*..#.......E..*#','####################'],
['####################','#P..*.....C....*...#','#.######.#######.#.#','#......#.....h...#.#','###.##.#####.#####.#','#...##.....#.......#','#.########.#.#######','#*......C..#.....*.#','#.###############..#','#....*..........E..#','####################'],
['####################','#P.....*..#..*....h#','#.#########.######.#','#...C......#......#.#','###.####.#.####.#..#','#...#....#......#..#','#.#.#.###########.##','#.#.*.....C.....#..#','#.#############.#..#','#....*..........E.*#','####################'],
['####################','#P*....C....*....h.#','#.#######.#######..#','#.......#.......#..#','###.###.#.#####.#.##','#...#...#.....#....#','#.###.#######.####.#','#*....#...C...#...*#','#.##.###.#####.##..#','#....*.........E...#','####################']
];
function parse(src){const s={p:{x:1,y:1},spawn:{x:1,y:1},e:[],cr:[],hearts:[],gates:[],walls:new Set(),lives:3,time:Math.max(45,75-level*3),won:false,lost:false};src.forEach((r,y)=>[...r].forEach((ch,x)=>{if(ch=='#')s.walls.add(x+','+y);if(ch=='P'){s.p={x,y};s.spawn={x,y}}if(ch=='*')s.cr.push({x,y});if(ch=='h')s.hearts.push({x,y});if(ch=='g')s.gates.push({x,y});if(ch=='C'||ch=='E')s.e.push({x,y,dx:ch=='C'?1:-1,dy:0,step:0})}));s.total=s.cr.length;return s}
function reset(){st=parse(maps[level%maps.length]);paused=false;combo=1;lastCrystal=0;toast('New cave opened');draw()}reset();
function blocked(x,y){return st.walls.has(x+','+y)}function same(a,b){return a.x===b.x&&a.y===b.y}function toast(t){ui.toast.textContent=t;ui.toast.classList.remove('flash');void ui.toast.offsetWidth;ui.toast.classList.add('flash')}function burst(x,y,t,color='#ffd86b'){for(let i=0;i<8;i++)particles.push({x:x*TILE+20,y:y*TILE+20,vx:(Math.random()-.5)*3,vy:(Math.random()-.7)*3,t,life:28,color})}
function move(dx,dy){if(paused)return;if(st.lost){reset();return}const nx=st.p.x+dx,ny=st.p.y+dy;if(!blocked(nx,ny)){st.p={x:nx,y:ny};walk++;burst(nx,ny,'·','#4cf4ff')}collect();critters();danger();draw();highlight(dx,dy)}
function collect(){const now=performance.now();let got=false;st.cr=st.cr.filter(c=>{if(same(c,st.p)){got=true;return false}return true});if(got){combo=now-lastCrystal<2400?Math.min(9,combo+1):1;lastCrystal=now;burst(st.p.x,st.p.y,'✦');toast('Crystal chain x'+combo)}let heart=false;st.hearts=st.hearts.filter(h=>{if(same(h,st.p)){heart=true;return false}return true});if(heart){st.lives=Math.min(5,st.lives+1);burst(st.p.x,st.p.y,'♥','#ff70b7');toast('Heart restored')}if(!st.cr.length&&!st.won){st.won=true;toast('Gate opens — next cave');setTimeout(nextLevel,700)}}
function critters(){for(const e of st.e){e.step++;if(e.step%2&&level<4)continue;let dx=e.dx,dy=e.dy;if(Math.random()<.35){const ax=Math.sign(st.p.x-e.x),ay=Math.sign(st.p.y-e.y);if(Math.abs(st.p.x-e.x)>Math.abs(st.p.y-e.y)){dx=ax;dy=0}else{dx=0;dy=ay}}let nx=e.x+dx,ny=e.y+dy;if(blocked(nx,ny)){dx=-e.dx;dy=e.dy? -e.dy : (Math.random()<.5?1:-1);nx=e.x+dx;ny=e.y+dy}if(!blocked(nx,ny)){e.x=nx;e.y=ny;e.dx=dx||e.dx;e.dy=dy}}}
function danger(){if(st.e.some(e=>same(e,st.p))){st.lives--;combo=1;shake=10;burst(st.p.x,st.p.y,'!','#ff4fa3');if(st.lives<=0){st.lost=true;toast('Critters win — tap Restart')}else{st.p={...st.spawn};toast('Ouch. Back to spawn.')}}}
function nextLevel(){level=(level+1)%maps.length;reset()}function waitTurn(){critters();danger();draw()}
function drawCell(x,y,color,txt,scale=1){const px=x*TILE,py=y*TILE;ctx.fillStyle=color;ctx.fillRect(px+4,py+4,TILE-8,TILE-8);if(txt){ctx.font=(24*scale)+'px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(txt,px+20,py+21)}}
function draw(){ctx.save();ctx.clearRect(0,0,800,520);if(shake>0){ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);shake--}ctx.fillStyle='#03010a';ctx.fillRect(0,0,800,520);const g=ctx.createRadialGradient(st.p.x*TILE+20,st.p.y*TILE+20,40,st.p.x*TILE+20,st.p.y*TILE+20,360);g.addColorStop(0,'#20125f');g.addColorStop(1,'#03010a');ctx.fillStyle=g;ctx.fillRect(0,0,800,520);for(const key of st.walls){const[x,y]=key.split(',').map(Number);drawCell(x,y,'#2b1956')}for(const c of st.cr)drawCell(c.x,c.y,'#03e5ff',EMO.x,1+Math.sin(performance.now()/180+c.x)*.15);for(const h of st.hearts)drawCell(h.x,h.y,'#ff5fa8',EMO.h);for(const e of st.e)drawCell(e.x,e.y,'#ff3c8d',EMO.c[(Math.floor(performance.now()/350)+e.x)%2],1+Math.sin(performance.now()/140)*.08);drawCell(st.p.x,st.p.y,'#a66cff',EMO.p[walk%EMO.p.length],1.05+Math.sin(performance.now()/100)*.06);for(const p of particles){ctx.globalAlpha=Math.max(0,p.life/28);ctx.fillStyle=p.color;ctx.font='24px serif';ctx.fillText(p.t,p.x,p.y);p.x+=p.vx;p.y+=p.vy;p.life--}ctx.globalAlpha=1;particles=particles.filter(p=>p.life>0);ctx.restore();ui.level.textContent='Level '+(level+1)+' / '+maps.length;ui.score.textContent=(st.total-st.cr.length)+' / '+st.total;ui.lives.textContent='♥'.repeat(st.lives);ui.timer.textContent=Math.max(0,Math.ceil(st.time))+'s';ui.combo.textContent='Combo x'+combo}
function frame(now){const dt=(now-last)/1000;last=now;if(!paused&&!st.lost&&!st.won){st.time-=dt;if(st.time<=0){st.lost=true;toast('Time collapsed — Restart')}}draw();requestAnimationFrame(frame)}requestAnimationFrame(frame);
function highlight(dx,dy){const b=[...document.querySelectorAll('[data-move]')].find(x=>x.dataset.move===dx+','+dy);if(!b)return;b.classList.add('active');setTimeout(()=>b.classList.remove('active'),120)}
document.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>{const[a,bv]=b.dataset.move.split(',').map(Number);move(a,bv)});id('wait').onclick=waitTurn;id('restart').onclick=reset;id('next').onclick=nextLevel;id('pause').onclick=()=>{paused=!paused;toast(paused?'Paused':'Moving again')};
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(k===' '||k==='r')reset();if(k==='p')paused=!paused;if(k==='arrowup'||k==='w')move(0,-1);if(k==='arrowdown'||k==='s')move(0,1);if(k==='arrowleft'||k==='a')move(-1,0);if(k==='arrowright'||k==='d')move(1,0)});
let sx=0,sy=0;canvas.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:false});canvas.addEventListener('touchend',e=>{const t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))>24){Math.abs(dx)>Math.abs(dy)?move(Math.sign(dx),0):move(0,Math.sign(dy));return}const r=canvas.getBoundingClientRect(),x=(t.clientX-r.left)/r.width,y=(t.clientY-r.top)/r.height;if(x<.28)move(-1,0);else if(x>.72)move(1,0);else if(y<.42)move(0,-1);else move(0,1)},{passive:false});
id('helpBtn').onclick=()=>id('helpModal').classList.add('open');id('closeHelp').onclick=()=>id('helpModal').classList.remove('open');id('helpModal').onclick=e=>{if(e.target.id==='helpModal')id('helpModal').classList.remove('open')};id('notesBtn').onclick=()=>{const d=id('agentNotes');d.open=!d.open;d.scrollIntoView({behavior:'smooth',block:'nearest'})};
</script>
</body></html>`;
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

module.exports = { swarmV2Html };
