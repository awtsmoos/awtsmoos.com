// B"H
/**
 * @file game-template.cjs
 * @description
 * Chapter 5: The finished creature receives one body from four sparks.
 */

function gameHtml(parts) {
  const notes = Object.entries(parts)
    .map(([role, text]) => `<h3>${escapeHtml(role)}</h3><pre>${escapeHtml(text)}</pre>`)
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Crystal Critters</title>
<style>
  body{margin:0;background:#09051a;color:#f6eeff;font-family:system-ui,Arial,sans-serif;display:grid;place-items:center;min-height:100vh}
  main{width:min(920px,96vw);padding:18px} canvas{width:100%;background:#120b2f;border:2px solid #a66cff;border-radius:18px;box-shadow:0 0 40px #7f35ff55}
  .hud{display:flex;justify-content:space-between;gap:12px;align-items:center;margin:12px 0;flex-wrap:wrap}.pill{background:#241045;border:1px solid #7bdcff;padding:8px 12px;border-radius:999px}
  button{background:#7bdcff;color:#09051a;border:0;border-radius:999px;padding:9px 14px;font-weight:800}details{margin-top:20px;background:#130a2d;border-radius:14px;padding:12px}pre{white-space:pre-wrap;max-height:120px;overflow:auto}
</style>
</head>
<body>
<main>
<h1>💎 Crystal Critters</h1>
<p>Collect all crystals before the cave critters touch you. Arrow keys or WASD move. Space restarts.</p>
<div class="hud"><span class="pill" id="status">B'H — entering cave</span><span class="pill" id="score">0 crystals</span><button id="restart">Restart</button></div>
<canvas id="game" width="800" height="520"></canvas>
<details><summary>Sub-agent design notes</summary>${notes}</details>
</main>
<script>
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const scoreEl = document.getElementById('score');
const tile = 40;
const levels = [
  ['####################','#P....*.....#.....*#','#.####.####.#.###..#','#....#....#...#....#','#.##.#.##.#####.##.#','#..#...#....*...#..#','##.#####.######.##.#','#..*......C.......*#','#.######.#######.###','#....*............E#','####################'],
  ['####################','#P..*....#....*....#','#.######.#.######..#','#....C...#......#..#','####.#######.##.#.##','#....#.....#..#....#','#.##.#.###.##.####.#','#..#...#....*......#','#.#######.########.#','#*...............E.#','####################']
];
let levelIndex = 0, state;
function parseLevel(src){const p={x:1,y:1}, e=[] , crystals=[], walls=new Set();src.forEach((row,y)=>[...row].forEach((c,x)=>{if(c=='#')walls.add(x+','+y);if(c=='P'){p.x=x;p.y=y}if(c=='C'||c=='E')e.push({x,y,dx:c=='C'?1:-1,dy:0});if(c=='*')crystals.push({x,y})}));return{p,e,crystals,walls,w:src[0].length,h:src.length,won:false,lost:false,t:0}}
function reset(){state=parseLevel(levels[levelIndex%levels.length]);draw();}
function blocked(x,y){return state.walls.has(x+','+y)}
function move(dx,dy){if(state.won||state.lost)return;const nx=state.p.x+dx,ny=state.p.y+dy;if(!blocked(nx,ny)){state.p.x=nx;state.p.y=ny}state.crystals=state.crystals.filter(c=>!(c.x==state.p.x&&c.y==state.p.y));tickCritters();check();draw();}
function tickCritters(){for(const c of state.e){let nx=c.x+c.dx,ny=c.y+c.dy;if(blocked(nx,ny)){c.dx*=-1;c.dy*=-1;nx=c.x+c.dx;ny=c.y+c.dy}if(!blocked(nx,ny)){c.x=nx;c.y=ny}}}
function check(){if(state.e.some(c=>c.x==state.p.x&&c.y==state.p.y)){state.lost=true;statusEl.textContent='A critter got you — press Space'}else if(!state.crystals.length){state.won=true;statusEl.textContent='Cave cleared! next level loading';setTimeout(()=>{levelIndex++;reset()},900)}else statusEl.textContent='Collect the glowing crystals'}
function cell(x,y,color,txt){ctx.fillStyle=color;ctx.fillRect(x*tile+4,y*tile+4,tile-8,tile-8);if(txt){ctx.fillStyle='#fff';ctx.font='24px serif';ctx.fillText(txt,x*tile+10,y*tile+28)}}
function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#09051a';ctx.fillRect(0,0,canvas.width,canvas.height);for(const key of state.walls){const [x,y]=key.split(',').map(Number);cell(x,y,'#32205a')}for(const c of state.crystals)cell(c.x,c.y,'#19f6ff','✦');for(const c of state.e)cell(c.x,c.y,'#ff3d81','☠');cell(state.p.x,state.p.y,'#a66cff','☺');scoreEl.textContent=(parseLevel(levels[levelIndex%levels.length]).crystals.length-state.crystals.length)+' crystals';}
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(k===' '){reset();return}if(k==='arrowup'||k==='w')move(0,-1);if(k==='arrowdown'||k==='s')move(0,1);if(k==='arrowleft'||k==='a')move(-1,0);if(k==='arrowright'||k==='d')move(1,0)});
document.getElementById('restart').onclick=reset;reset();
</script>
</body></html>`;
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

module.exports = { gameHtml };
