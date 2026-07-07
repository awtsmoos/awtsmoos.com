// B"H
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const movie=readFileSync('tools/masaiOneMinuteJourneyMovie.html','utf8');
const expected=['ancient-cedar','valley-oak','tall-pine','silver-olive','fruit-orchard'];
for(const id of expected) assert(movie.includes(id),`missing real tree variety ${id}`);
assert(movie.includes('REAL_TREE_VARIETIES'), 'movie must declare variety catalog');
assert(movie.includes('realTreeVarietyCount'), 'movie report must expose variety count');
assert(movie.includes('createHeroTree'), 'movie must use real Awtsmoos3D hero trees');
assert(!movie.includes('buildTree(THREE'), 'movie must not use fake cinematic buildTree');
console.log(JSON.stringify({ok:true,test:'realTreeVarietyAudit',varieties:expected},null,2));
