#!/usr/bin/env node
/**
 * B"H
 * @file ladderRuntimeAlignmentAudit.mjs
 * @description Chapter 572: Every rewritten lava ladder level must satisfy the
 * new generated contract: high safe spawn, lava visibly below platforms,
 * collectible heights from platform tops, safeRects on every platform.
 */
import fs from 'node:fs';
import path from 'node:path';
const DIR = 'levels/ladder/data';
const files = fs.readdirSync(DIR).filter(f => /^ladder-\d+\.json$/.test(f)).sort((a,b)=>Number(a.match(/\d+/)[0])-Number(b.match(/\d+/)[0]));
const rows = v => Array.isArray(v) ? v : v && typeof v === 'object' ? Object.values(v).filter(x => x && typeof x === 'object') : [];
const n = (v, f=0) => Number.isFinite(Number(v)) ? Number(v) : f;
const ptypes = ['SolidBlock','MovingPlatform','BetrayalPlatform','SlipperyPlatform','FastPusherPlatform','PusherPlatform','DisappearingPlatform','TrapdoorPlatform'];
function platforms(d){ return ptypes.flatMap(key => rows(d.nivrayim?.[key]).map(row => ({ key, row, x:n(row.position?.x), z:n(row.position?.z), y:n(row.position?.y), width:n(row.width ?? row.dimensions?.x ?? row.size?.x,2), depth:n(row.depth ?? row.dimensions?.z ?? row.size?.z,2), height:n(row.height ?? row.dimensions?.y ?? row.size?.y,1) }))); }
const top = p => p.y + p.height / 2;
const nearest = (ps,obj) => ps.reduce((best,p)=>{ const d=Math.hypot(n(obj.position?.x)-p.x,n(obj.position?.z)-p.z); return !best||d<best.d?{p,d}:best;},null)?.p;
const failures = [];
for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(DIR,file),'utf8'));
  const ps = platforms(data), start = ps[0];
  if (ps.length < 8) failures.push({file,type:'tooFewPlatforms',count:ps.length});
  for (const t of rows(data.nivrayim.ProceduralTerrain)) if (t.isSolid !== false || t.textureType !== 'lavaBasin' || n(t.position?.y) > -0.75) failures.push({file,type:'terrain',t});
  for (const s of rows(data.nivrayim.SpikeField)) if (!s.lava || n(s.position?.y) > -0.25 || n(s.groundY) > -0.35 || n(s.height) < 0.25) failures.push({file,type:'lavaSurface',s});
  for (const p of ps) if (!p.row.safeRect || Math.abs(n(p.row.safeRect.x)-p.x)>.001 || Math.abs(n(p.row.safeRect.z)-p.z)>.001 || Math.abs(n(p.row.safeRect.width)-p.width)>.001 || Math.abs(n(p.row.safeRect.depth)-p.depth)>.001) failures.push({file,type:'safeRect',platform:p.row.name});
  for (const player of rows(data.nivrayim.Chossid)) if (start && Math.abs(n(player.position?.y) - (top(start)+0.08)) > .02) failures.push({file,type:'playerY',player:player.position,expected:top(start)+0.08});
  for (const coin of rows(data.nivrayim.Coin)) { const p = nearest(ps, coin); if (p && Math.abs(n(coin.position?.y) - (top(p)+0.72)) > .04) failures.push({file,type:'coinY',coin:coin.name,y:coin.position?.y,expected:top(p)+0.72}); }
  for (const box of rows(data.nivrayim.TzedakahBox)) { const p = nearest(ps, box); if (p && Math.abs(n(box.position?.y) - (top(p)+0.55)) > .04) failures.push({file,type:'boxY',box:box.name,y:box.position?.y,expected:top(p)+0.55}); }
}
if (failures.length) { console.error(JSON.stringify({ok:false,failures:failures.slice(0,40),count:failures.length},null,2)); process.exit(1); }
console.log(JSON.stringify({ok:true,files:files.length},null,2));
