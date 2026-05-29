// B"H
import fs from 'fs';
import { LEVELS } from '../../js/data/levels.js';

const SOLID_TRICKS = new Set(['shatter','vanish','ice','safeSpike','oneWay','booster','reverseBooster','magnet','antiSpeed','antiJump','baitShift','dodgePlatform','ambush','commitDrop','motionOnly','fakeCheckpoint']);
const REQUIRED_TEACHERS = ['safeSpike','dodgePlatform'];
const edgeGap = (a,b) => a.x + a.w < b.x ? b.x - (a.x + a.w) : b.x + b.w < a.x ? a.x - (b.x + b.w) : 0;
const centerDx = (a,b) => Math.abs((a.x+a.w/2)-(b.x+b.w/2));
const jumpKind = (from,to) => {
  if (to.y >= from.y) return to.y - from.y <= 185 && edgeGap(from,to) <= 180 ? 'drop' : '';
  const dy = from.y - to.y;
  if (dy >= 0 && dy <= 124 && (centerDx(from,to) <= 300 || edgeGap(from,to) <= 142)) return 'jump';
  return '';
};
const nodesOf = level => [
  ...(level.platforms||[]).map((p,i)=>({...p,id:`P${i}`,kind:'platform'})),
  ...(level.rotatingPlatforms||[]).map((p,i)=>({...p,id:`R${i}`,kind:'rotor'})),
  ...(level.trickPlatforms||[]).filter(t=>SOLID_TRICKS.has(t.kind)).map((p,i)=>({...p,id:`T${i}:${p.kind}`}))
];
const startsOf = (level,nodes) => nodes.filter(n => (level.spawn.x + 34 > n.x - 24 && level.spawn.x < n.x + n.w + 24 && level.spawn.y + 48 <= n.y + 24) || (n.x < 420 && n.y >= 330));
const reachable = (level) => {
  const nodes = nodesOf(level);
  const reached = new Set(startsOf(level,nodes));
  const prev = new Map();
  const queue = [...reached];
  while(queue.length) {
    const from = queue.shift();
    for (const to of nodes) {
      if (reached.has(to)) continue;
      const kind = jumpKind(from,to);
      if (!kind) continue;
      reached.add(to); prev.set(to,{from,kind}); queue.push(to);
    }
  }
  return {nodes,reached,prev};
};
const pointReach = (p,nodes) => nodes.some(n => {
  const coin = {x:p.x-14,y:p.y-14,w:28,h:28};
  const closeHoriz = edgeGap(n,coin) <= 190 || Math.abs((n.x+n.w/2)-p.x) <= 320;
  const closeVert = p.y >= n.y - 165 && p.y <= n.y + 190;
  return closeHoriz && closeVert;
});
const doorReach = (door,nodes) => nodes.some(n => {
  const d = {x:door.x,y:door.y,w:door.w,h:door.h};
  return edgeGap(n,d) <= 210 && door.y >= n.y - 210 && door.y <= n.y + 185;
});
const mechanicWords = level => {
  const kinds = new Set((level.trickPlatforms||[]).map(t=>t.kind));
  const out = [];
  if (kinds.has('booster') || kinds.has('reverseBooster')) out.push('boost timing');
  if (kinds.has('safeSpike')) out.push('safe-spike bridge');
  if (kinds.has('dodgePlatform') || kinds.has('baitShift')) out.push('bait/dodge memory');
  if (kinds.has('phantom') || kinds.has('falseSpike')) out.push('false-route literacy');
  if (kinds.has('oneWay')) out.push('one-way descent');
  if (kinds.has('ice')) out.push('ice control');
  if ((level.rotatingPlatforms||[]).length) out.push('rotor timing');
  return out;
};
let md='B"H\n# Human Paper Route Read\n\n';
let counts={PASS:0,WARNING:0,FAIL:0};
for (const [i,level] of LEVELS.entries()) {
  const r = reachable(level);
  const reachedNodes = [...r.reached];
  const realCoins = level.coins||[];
  const keys = level.keys||[];
  const coinBad = realCoins.filter(c=>!pointReach(c,reachedNodes));
  const keyBad = keys.filter(k=>!pointReach(k,reachedNodes));
  const dOk = doorReach(level.door,reachedNodes);
  const kinds = new Set((level.trickPlatforms||[]).map(t=>t.kind));
  const missingTeach = REQUIRED_TEACHERS.filter(k=>!kinds.has(k));
  const triggerTeach = (level.triggers||[]).some(t=>/open|woke|invented|spike|door|teeth|floor|one-way|platform/i.test(t.message||''));
  const highReadable = reachedNodes.some(n=>n.y<=-120) && reachedNodes.some(n=>n.x>=900 && n.y<=300);
  let status='PASS'; const notes=[];
  if (coinBad.length) notes.push(`${coinBad.length} real coin(s) not reachable by paper graph`);
  if (keyBad.length) notes.push(`${keyBad.length} key(s) not reachable by paper graph`);
  if (!dOk) notes.push('door not reachable by paper graph');
  if (missingTeach.length) notes.push(`missing teacher mechanics: ${missingTeach.join(',')}`);
  if (!triggerTeach) notes.push('trigger messages do not teach enough');
  if (!highReadable) notes.push('upper/sky route not visible in paper graph');
  if (coinBad.length || keyBad.length || !dOk || missingTeach.length || !highReadable) status='FAIL';
  else if ((level.width||0)>9000 || mechanicWords(level).length>=5) { status='WARNING'; notes.push('long/dense chamber: mechanically readable, but human difficulty high'); }
  counts[status]++;
  md += `## ${String(i+1).padStart(2,'0')} ${level.name}\n`;
  md += `- status: ${status}\n`;
  md += `- reached solids: ${reachedNodes.length}/${r.nodes.length}; real coins reachable: ${realCoins.length-coinBad.length}/${realCoins.length}; keys reachable: ${keys.length-keyBad.length}/${keys.length}; door reachable: ${dOk}\n`;
  md += `- expected human mechanics: ${mechanicWords(level).join(', ') || 'basic jump/drop'}\n`;
  md += `- notes: ${notes.length?notes.join('; '):'paper route reads human-playable: next bodies are within authored jump/drop/rotor/trick logic and collectibles/door are near reachable solids.'}\n\n`;
}
md += `# Summary\n- PASS: ${counts.PASS}\n- WARNING: ${counts.WARNING}\n- FAIL: ${counts.FAIL}\n`;
fs.writeFileSync('AI_THOUGHTS/manual-51-audit/06-human-paper-route-read.md', md);
console.log(JSON.stringify(counts));
console.log(md.split('\n').filter(line=>line.startsWith('## ')||line.startsWith('- status:')||line.startsWith('- notes:')||line.startsWith('# Summary')||line.startsWith('- PASS')||line.startsWith('- WARNING')||line.startsWith('- FAIL')).join('\n'));
if (counts.FAIL) process.exit(1);
