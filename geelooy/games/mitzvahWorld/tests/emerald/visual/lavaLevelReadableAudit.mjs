#!/usr/bin/env node
/**
 * B"H
 * @file lavaLevelReadableAudit.mjs
 * @description Chapter 606: All 20 lava levels must be built from manual source
 * modules, have visible non-solid lava, safe start islands, and JS mirrors.
 */
import fs from 'node:fs';
const files = fs.readdirSync('levels/ladder/data').filter(f=>/^ladder-\d+\.json$/.test(f)).sort((a,b)=>+a.match(/\d+/)-+b.match(/\d+/));
const rows = value => Array.isArray(value) ? value : value && typeof value === 'object' ? Object.values(value).filter(x=>x&&typeof x==='object') : [];
const failures=[];
if (files.length !== 20) failures.push({type:'fileCount', count:files.length});
for (const file of files) {
 const level = Number(file.match(/\d+/)[0]);
 const d=JSON.parse(fs.readFileSync('levels/ladder/data/'+file,'utf8'));
 const js = file.replace(/\.json$/, '.js');
 const mirror = fs.existsSync('levels/ladder/data/'+js) ? fs.readFileSync('levels/ladder/data/'+js,'utf8') : '';
 if (!fs.existsSync('levels/ladder/data/'+js)) failures.push({file,type:'missingJsMirror'});
 if (!mirror.includes(`manual lava source level${String(level).padStart(2,'0')}.js`)) failures.push({file,type:'mirrorNotManual'});
 if (!/hand|manual|handmade|hand-laid|hand-authored/i.test(d.description || '')) failures.push({file,type:'descriptionNotManual',description:d.description});
 const start=rows(d.nivrayim.SolidBlock)[0];
 if (!start || start.position.y < 1.15 || start.width < 8 || start.depth < 5.4) failures.push({file,type:'badStartIsland',start});
 for (const t of rows(d.nivrayim.ProceduralTerrain)) if (t.isSolid !== false || t.textureType !== 'lavaBasin' || Number(t.position?.y) > -0.75) failures.push({file,type:'terrain',t});
 for (const s of rows(d.nivrayim.SpikeField)) if (!s.lava || Number(s.position?.y) > -0.25 || Number(s.height) < 0.25) failures.push({file,type:'lavaSurface',s});
}
if (failures.length) { console.error(JSON.stringify({ ok:false, failures:failures.slice(0,30), count:failures.length }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok:true, files:files.length }, null, 2));
