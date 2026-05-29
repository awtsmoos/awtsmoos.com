// B"H
import fs from 'fs';
import { LEVELS } from '../../js/data/levels.js';
import { ascentRungs, midRouteEntryRungs } from '../../js/data/enrichment/ascent.js';

const SOLID_TRICKS = new Set(['shatter','vanish','ice','safeSpike','oneWay','booster','reverseBooster','magnet','antiSpeed','antiJump','baitShift','dodgePlatform','ambush','commitDrop','motionOnly','fakeCheckpoint']);
const HAZARD_TRICKS = new Set(['falseSpike','ghostSpike','commitSpike']);
const body = (p, tag, kind='platform') => ({...p, tag, kind});
const edgeGap = (a,b) => a.x + a.w < b.x ? b.x - (a.x + a.w) : b.x + b.w < a.x ? a.x - (b.x + b.w) : 0;
const centerDx = (a,b) => Math.abs((a.x + a.w/2) - (b.x + b.w/2));
const rise = (a,b) => a.y - b.y;
const overlaps = (a,b,pad=0) => a.x < b.x+b.w+pad && a.x+a.w+pad > b.x && a.y < b.y+b.h+pad && a.y+a.h+pad > b.y;
const solidNodes = level => [
  ...(level.platforms||[]).map((p,i)=>body(p,`P${i}`)),
  ...(level.rotatingPlatforms||[]).map((p,i)=>body(p,`R${i}`,'rotor')),
  ...(level.trickPlatforms||[]).filter(t=>SOLID_TRICKS.has(t.kind)).map((p,i)=>body(p,`T${i}:${p.kind}`,p.kind))
];
const hazardNodes = level => [
  ...(level.spikes||[]).map((p,i)=>body(p,`S${i}`,'spike')),
  ...(level.trickPlatforms||[]).filter(t=>HAZARD_TRICKS.has(t.kind)).map((p,i)=>body(p,`HT${i}:${p.kind}`,p.kind))
];
const authoredMainline = level => {
  const out = [];
  let lastX = -Infinity;
  for (const [i,p] of (level.platforms||[]).entries()) {
    if (out.length && p.x < lastX - 180) break;
    if (p.y < -120) break;
    if (p.x > level.door.x + 320) break;
    out.push(body(p,`P${i}`));
    lastX = p.x;
  }
  return out;
};
const hopRating = (a,b) => {
  const gap = edgeGap(a,b), up = rise(a,b), drop = b.y-a.y, dx = centerDx(a,b);
  if (up > 126 || (gap > 170 && up > 0) || drop > 230) return 'IMPOSSIBLE';
  if (up > 116 || (gap > 145 && dx > 305) || drop > 195) return 'EXTREME';
  if (up > 84 || gap > 105 || dx > 255 || drop > 155) return 'TIGHT';
  return 'SAFE';
};
const hops = nodes => nodes.slice(0,-1).map((n,i)=>({from:n,to:nodes[i+1],rating:hopRating(n,nodes[i+1])}));
const pointNear = (nodes, p) => {
  let best = null;
  for (const n of nodes) {
    const coin = {x:p.x-13,y:p.y-13,w:26,h:26};
    const gap = edgeGap(n,coin), vertical = p.y - n.y, dx = Math.abs((n.x+n.w/2)-p.x);
    const score = gap + Math.max(0, Math.abs(vertical)-125) * 2 + dx * 0.04;
    if (!best || score < best.score) best = { node:n, gap, vertical, dx, score };
  }
  return best;
};
const upperReadable = level => {
  const solids = solidNodes(level);
  const hasRung = ([x,y,w]) => solids.some(s => Math.abs(s.x-x)<=3 && Math.abs(s.y-y)<=3 && s.w >= w-3);
  return ascentRungs().every(hasRung) && midRouteEntryRungs().every(hasRung);
};
const classify = level => {
  const main = authoredMainline(level);
  const mainHops = hops(main);
  const severe = mainHops.filter(h => h.rating === 'EXTREME' || h.rating === 'IMPOSSIBLE');
  const tight = mainHops.filter(h => h.rating === 'TIGHT');
  const solids = solidNodes(level);
  const hazards = hazardNodes(level);
  const doorNear = pointNear(solids,{x:level.door.x + level.door.w/2, y:level.door.y + level.door.h/2});
  const doorOk = doorNear && doorNear.gap <= 190 && doorNear.vertical >= -205 && doorNear.vertical <= 170;
  const required = [...(level.keys||[])];
  const requiredProblems = required.map(k=>({k,near:pointNear(solids,k)})).filter(x=>!x.near || x.near.gap > 190 || x.near.vertical < -205 || x.near.vertical > 170);
  const coinWarnings = (level.coins||[]).map(c=>({c,near:pointNear(solids,c)})).filter(x=>!x.near || x.near.gap > 210 || x.near.vertical < -230 || x.near.vertical > 185);
  const trapOverlap = hazards.filter(t => main.some(s => overlaps(t,s,-4)));
  const trickKinds = [...new Set((level.trickPlatforms||[]).map(t=>t.kind))].sort();
  const devilReadable = trickKinds.includes('safeSpike') && trickKinds.includes('dodgePlatform');
  let status = 'PASS';
  const notes = [];
  if (!doorOk) notes.push(`door is not comfortably near a solid (gap ${doorNear?.gap}, vertical ${doorNear?.vertical})`);
  if (requiredProblems.length) notes.push(`${requiredProblems.length} key(s) require inspection`);
  if (trapOverlap.length) notes.push(`${trapOverlap.length} hazard overlaps authored mainline`);
  if (!upperReadable(level)) notes.push('guaranteed upper route spine missing/unreadable');
  if (!devilReadable) notes.push('devil teaching pair missing');
  if (severe.length) notes.push(`${severe.length} severe mainline hop(s) in authored sequence`);
  if (coinWarnings.length) notes.push(`${coinWarnings.length} optional/valuable coin placement(s) far from nearest solid`);
  if (!doorOk || requiredProblems.length || trapOverlap.length || !upperReadable(level) || !devilReadable || severe.some(h=>h.rating==='IMPOSSIBLE')) status = 'FAIL';
  else if (severe.length || tight.length > 6 || coinWarnings.length) status = 'WARNING';
  return { status, notes, main, tight, severe, coinWarnings, requiredProblems, doorNear, trickKinds, trapOverlap };
};
let md = 'B"H\n# Paper Solvability Ledger v2\n\n';
let counts = {PASS:0, WARNING:0, FAIL:0};
for (const [i,level] of LEVELS.entries()) {
  const r = classify(level);
  counts[r.status]++;
  md += `## ${String(i+1).padStart(2,'0')} ${level.name}\n`;
  md += `- status: ${r.status}\n`;
  md += `- authored mainline platforms read: ${r.main.length}; tight hops: ${r.tight.length}; severe hops: ${r.severe.length}\n`;
  md += `- door nearest: ${r.doorNear?.node?.tag || 'none'} gap ${r.doorNear?.gap ?? 'n/a'} vertical ${r.doorNear?.vertical ?? 'n/a'}\n`;
  md += `- coins: ${(level.coins||[]).length}; keys: ${(level.keys||[]).length}; suspicious coins: ${r.coinWarnings.length}; key problems: ${r.requiredProblems.length}\n`;
  md += `- tricks: ${r.trickKinds.join(', ')}\n`;
  if (r.tight.length) md += `- tight samples: ${r.tight.slice(0,4).map(h=>`${h.from.tag}->${h.to.tag}/gap${edgeGap(h.from,h.to)}/rise${rise(h.from,h.to)}/drop${h.to.y-h.from.y}`).join('; ')}\n`;
  if (r.severe.length) md += `- severe samples: ${r.severe.slice(0,4).map(h=>`${h.from.tag}->${h.to.tag}:${h.rating}/gap${edgeGap(h.from,h.to)}/rise${rise(h.from,h.to)}/drop${h.to.y-h.from.y}`).join('; ')}\n`;
  if (r.coinWarnings.length) md += `- coin samples: ${r.coinWarnings.slice(0,4).map(x=>`(${x.c.x},${x.c.y},${x.c.kind}) near ${x.near?.node?.tag} gap${x.near?.gap} vert${x.near?.vertical}`).join('; ')}\n`;
  md += `- notes: ${r.notes.length ? r.notes.join('; ') : 'paper route reads as playable: platform spacing, required key/door, upper route, and devil teaching are coherent.'}\n\n`;
}
md += `# Summary\n- PASS: ${counts.PASS}\n- WARNING: ${counts.WARNING}\n- FAIL: ${counts.FAIL}\n`;
fs.writeFileSync('AI_THOUGHTS/manual-51-audit/05-paper-solvability-ledger-v2.md', md);
console.log(JSON.stringify(counts));
console.log(md.split('\n').filter(line => line.startsWith('## ') || line.startsWith('- status:') || line.startsWith('- notes:')).join('\n'));
if (counts.FAIL) process.exit(1);
