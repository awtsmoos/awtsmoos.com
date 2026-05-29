// B"H
import fs from 'fs';
import { LEVELS } from '../../js/data/levels.js';

const SOLID_TRICKS = new Set(['shatter','vanish','ice','safeSpike','oneWay','booster','reverseBooster','magnet','antiSpeed','antiJump','baitShift','dodgePlatform','ambush','commitDrop','motionOnly','fakeCheckpoint']);
const BAD_TRICKS = new Set(['falseSpike','ghostSpike','commitSpike','phantom']);
const solidNodes = level => [
  ...(level.platforms || []).map((p,i)=>({...p, tag:`P${i}`, kind:'platform'})),
  ...(level.rotatingPlatforms || []).map((p,i)=>({...p, tag:`R${i}`, kind:'rotor'})),
  ...(level.trickPlatforms || []).filter(t=>SOLID_TRICKS.has(t.kind)).map((p,i)=>({...p, tag:`T${i}:${p.kind}`, kind:p.kind}))
];
const trapNodes = level => [
  ...(level.spikes || []).map((p,i)=>({...p, tag:`S${i}`, kind:'spike'})),
  ...(level.trickPlatforms || []).filter(t=>BAD_TRICKS.has(t.kind)).map((p,i)=>({...p, tag:`BAD${i}:${p.kind}`, kind:p.kind}))
];
const edgeGap = (a,b) => a.x + a.w < b.x ? b.x - (a.x + a.w) : b.x + b.w < a.x ? a.x - (b.x + b.w) : 0;
const centerDx = (a,b) => Math.abs((a.x+a.w/2)-(b.x+b.w/2));
const dyUp = (a,b) => a.y - b.y;
const hopRating = (a,b) => {
  const gap = edgeGap(a,b), up = dyUp(a,b), drop = b.y-a.y, dx = centerDx(a,b);
  if (up > 124 || gap > 170 && up > 0 || drop > 210) return 'IMPOSSIBLE';
  if (up > 116 || gap > 142 && dx > 300 || drop > 185) return 'EXTREME';
  if (up > 80 || gap > 90 || dx > 240) return 'TIGHT';
  return 'SAFE';
};
const nearest = (nodes, point) => {
  const body = { x: point.x-13, y: point.y-13, w: 26, h: 26 };
  let best = null;
  for (const n of nodes) {
    const g = edgeGap(n, body), up = n.y - point.y, dx = Math.abs((n.x+n.w/2)-point.x);
    const score = g + Math.max(0, Math.abs(up)-90)*1.5 + dx*0.05;
    if (!best || score < best.score) best = { node:n, gap:g, vertical:point.y-n.y, dx, score };
  }
  return best;
};
const overlaps = (a,b,pad=0) => a.x < b.x+b.w+pad && a.x+a.w+pad > b.x && a.y < b.y+b.h+pad && a.y+a.h+pad > b.y;
const sequenceStats = nodes => {
  const route = nodes.filter(n => n.kind === 'platform').sort((a,b)=>a.x-b.x);
  const bad = [];
  for (let i=0;i<route.length-1;i++) {
    const r = hopRating(route[i], route[i+1]);
    if (r !== 'SAFE') bad.push({ from:route[i].tag, to:route[i+1].tag, rating:r, gap:edgeGap(route[i], route[i+1]), rise:dyUp(route[i], route[i+1]), drop:route[i+1].y-route[i].y });
  }
  return bad;
};
let md = 'B"H\n# Paper Solvability Ledger\n\n';
let summary = { pass:0, warning:0, fail:0 };
for (const [i, level] of LEVELS.entries()) {
  const solids = solidNodes(level), traps = trapNodes(level);
  const authoredSolids = solids.filter(n => n.x <= (level.door?.x || level.width));
  const suspiciousHops = sequenceStats(authoredSolids);
  const coins = [...(level.coins||[]), ...(level.keys||[])];
  const coinProblems = coins.map(c => ({ c, near: nearest(solids,c) })).filter(x => x.near && (x.near.gap > 145 || x.near.vertical < -165 || x.near.vertical > 130));
  const doorNear = nearest(solids, { x: level.door.x+level.door.w/2, y: level.door.y+level.door.h/2 });
  const doorBad = !doorNear || doorNear.gap > 165 || doorNear.vertical < -185 || doorNear.vertical > 150;
  const routeTrapOverlaps = traps.filter(t => solids.some(s => overlaps(t,s,-2)));
  const trickKinds = [...new Set((level.trickPlatforms||[]).map(t=>t.kind))].sort();
  const hasUpper = solids.some(s => s.y < -120) && solids.some(s => s.x >= 900 && s.y <= 300);
  const hasReadableDevil = trickKinds.includes('safeSpike') && trickKinds.includes('dodgePlatform') && (level.triggers||[]).some(t=>/invented spikes|woke|absence became spikes/.test(t.message||''));
  const severeHops = suspiciousHops.filter(h => h.rating === 'EXTREME' || h.rating === 'IMPOSSIBLE');
  let status = 'PASS';
  const notes = [];
  if (doorBad) notes.push(`door nearest gap ${doorNear?.gap} vertical ${doorNear?.vertical}`);
  if (coinProblems.length) notes.push(`${coinProblems.length} collectible/key placements need trick/route interpretation`);
  if (severeHops.length) notes.push(`${severeHops.length} severe authored-platform gaps, likely using rotors/tricks/boosters`);
  if (routeTrapOverlaps.length) notes.push(`${routeTrapOverlaps.length} trap-solid overlaps to inspect`);
  if (!hasUpper) notes.push('upper route not obvious from enriched solids');
  if (!hasReadableDevil) notes.push('devil teaching set incomplete');
  if (doorBad || routeTrapOverlaps.length || !hasReadableDevil) status = 'FAIL';
  else if (coinProblems.length || severeHops.length || !hasUpper) status = 'WARNING';
  summary[status.toLowerCase()]++;
  md += `## ${String(i+1).padStart(2,'0')} ${level.name}\n`;
  md += `- status: ${status}\n- width: ${level.width}; spawn: (${level.spawn.x},${level.spawn.y}); door: (${level.door.x},${level.door.y})\n`;
  md += `- solids: ${solids.length}; coins: ${(level.coins||[]).length}; keys: ${(level.keys||[]).length}; spikes: ${(level.spikes||[]).length}; tricks: ${trickKinds.join(', ')}\n`;
  md += `- suspicious mainline hops: ${suspiciousHops.length}; severe: ${severeHops.length}\n`;
  if (suspiciousHops.length) md += `- hop samples: ${suspiciousHops.slice(0,5).map(h=>`${h.from}->${h.to}:${h.rating}/gap${h.gap}/rise${h.rise}/drop${h.drop}`).join('; ')}\n`;
  if (coinProblems.length) md += `- collectible samples: ${coinProblems.slice(0,5).map(x=>`(${x.c.x},${x.c.y},${x.c.kind||'key'} near ${x.near.node.tag} gap${x.near.gap} vert${x.near.vertical})`).join('; ')}\n`;
  if (notes.length) md += `- notes: ${notes.join('; ')}\n`;
  else md += '- notes: main route and required systems read as human-playable on paper.\n';
  md += '\n';
}
md += `# Summary\n- PASS: ${summary.pass}\n- WARNING: ${summary.warning}\n- FAIL: ${summary.fail}\n`;
fs.writeFileSync('AI_THOUGHTS/manual-51-audit/04-paper-solvability-ledger.md', md);
console.log(md);
if (summary.fail) process.exit(1);
