// B"H
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html=readFileSync('tools/masaiOneMinuteJourneyMovie.html','utf8');
const render=readFileSync('tools/renderMasaiOneMinuteJourneyMovie.mjs','utf8');
for(const token of ['HeightFieldGenerator','ForestScatterPlanner','CliffBandGenerator','JourneyFogController','buildTree','chossid.glb','60','walk_Armature','run_Armature']) assert(html.includes(token)||render.includes(token),`missing ${token}`);
assert(render.includes('/Users/awtsmoos/Movies/mitzvahWorld/masai-one-minute-journey-reusable-world.mp4'));
console.log(JSON.stringify({ok:true,test:'masaiOneMinuteMovieStaticAudit'},null,2));
