// B"H
import fs from 'fs';
import { LEVELS } from '../../js/data/levels.js';

const PLAYER = { w: 34, h: 48 };
const solidTrickKinds = new Set(['shatter','vanish','ice','safeSpike','oneWay','booster','reverseBooster','magnet','antiSpeed','antiJump','baitShift','ambush','commitDrop','motionOnly','fakeCheckpoint']);
const lethalTrickKinds = new Set(['ghostSpike','falseSpike','commitSpike']);
const edgeGap = (a,b) => a.x + a.w < b.x ? b.x - (a.x + a.w) : b.x + b.w < a.x ? a.x - (b.x + b.w) : 0;
const centerDx = (a,b) => Math.abs((a.x + a.w / 2) - (b.x + b.w / 2));
const jumpable = (from,to) => {
  if (to.y >= from.y) return to.y - from.y <= 185 && edgeGap(from,to) <= 180;
  const dy = from.y - to.y;
  return dy >= 0 && dy <= 124 && (centerDx(from,to) <= 300 || edgeGap(from,to) <= 142);
};
const solids = level => [
  ...(level.platforms||[]).map((p,i)=>({...p,id:`p${i}`,type:'platform'})),
  ...(level.rotatingPlatforms||[]).map((p,i)=>({...p,id:`r${i}`,type:'rotor'})),
  ...(level.trickPlatforms||[]).filter(t=>solidTrickKinds.has(t.kind)).map((p,i)=>({...p,id:`t${i}:${p.kind}`,type:'trick'}))
];
const pointReach = (node, point) => {
  const coinBody = { x: point.x - 13, y: point.y - 13, w: 26, h: 26 };
  return jumpable(node, { x: point.x - 13, y: point.y - PLAYER.h, w: 26, h: PLAYER.h }) ||
    (coinBody.x < node.x + node.w + 48 && coinBody.x + coinBody.w > node.x - 48 && coinBody.y < node.y + 80 && coinBody.y + coinBody.h > node.y - 150);
};
const reachableNodes = level => {
  const nodes = solids(level);
  const start = { x: level.spawn.x, y: level.spawn.y + PLAYER.h, w: PLAYER.w, h: 1, id:'spawn', type:'spawn' };
  const reached = new Set(); const queue = [];
  for (const node of nodes) if (jumpable(start,node) || (level.spawn.x + PLAYER.w > node.x && level.spawn.x < node.x + node.w && level.spawn.y + PLAYER.h <= node.y + 16)) { reached.add(node); queue.push(node); }
  while(queue.length) { const cur = queue.shift(); for (const node of nodes) if (!reached.has(node) && jumpable(cur,node)) { reached.add(node); queue.push(node); } }
  return { nodes, reached };
};
const overlaps = (a,b) => a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
let report = 'B"H\n# Sulam HaSod Manual Reachability Audit v2\n\n';
let bad = 0;
LEVELS.forEach((level, index) => {
  const {nodes,reached} = reachableNodes(level); const reachedList = [...reached];
  const coins = level.coins || [], keys = level.keys || [], door = level.door;
  const unreachableCoins = coins.filter(c => !reachedList.some(n => pointReach(n,c)));
  const unreachableKeys = keys.filter(k => !reachedList.some(n => pointReach(n,k)));
  const doorReach = reachedList.some(n => jumpable(n,door) || overlaps({x:n.x,y:n.y-PLAYER.h,w:n.w,h:PLAYER.h+n.h},door));
  const lethalSolids = (level.trickPlatforms||[]).filter(t=>lethalTrickKinds.has(t.kind) && reachedList.some(n=>overlaps(n,t)));
  const spikeOverlaps = (level.spikes||[]).filter(s=>reachedList.some(n=>overlaps(n,s)));
  const result = unreachableCoins.length || unreachableKeys.length || !doorReach || lethalSolids.length || spikeOverlaps.length ? 'FAIL' : 'PASS';
  if (result === 'FAIL') bad++;
  report += `## ${String(index+1).padStart(2,'0')} ${level.name}\n`;
  report += `- status: ${result}\n- reachable solids: ${reached.size}/${nodes.length}\n- coins unreachable: ${unreachableCoins.length}/${coins.length}\n- keys unreachable: ${unreachableKeys.length}/${keys.length}\n- door reachable: ${doorReach}\n- lethal trick overlaps reachable route: ${lethalSolids.length}\n- spike overlaps reachable route: ${spikeOverlaps.length}\n`;
  if (result === 'FAIL') {
    report += `- failing coins: ${unreachableCoins.slice(0,10).map(c=>`(${c.x},${c.y},${c.kind})`).join(' ')}\n`;
    report += `- failing keys: ${unreachableKeys.slice(0,5).map(k=>`(${k.x},${k.y})`).join(' ')}\n`;
    report += `- overlap spikes: ${spikeOverlaps.slice(0,5).map(s=>`(${s.x},${s.y},${s.w},${s.h})`).join(' ')}\n`;
  }
  report += '\n';
});
report += `# Summary\n- failing levels: ${bad}\n- total levels: ${LEVELS.length}\n`;
fs.writeFileSync('AI_THOUGHTS/manual-51-audit/02-reachability-report.md', report);
console.log(report);
if (bad) process.exit(1);
