// B"H
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const movie=readFileSync('tools/masaiOneMinuteJourneyMovie.html','utf8');
const builder=readFileSync('geelooy/libs/awtsmoosCinematicWorld/nature/ProceduralTreeBuilder.js','utf8');
assert(movie.includes('/geelooy/libs/awtsmoos3d/tree/heroTree.js'), 'movie must import real Awtsmoos3D hero tree');
assert(movie.includes('createHeroTree'), 'movie must instantiate createHeroTree');
assert(!movie.includes('buildTree(THREE'), 'movie must not use old fake buildTree');
assert(!builder.includes('SphereGeometry'), 'fake sphere-tree generation must be deleted');
assert(!builder.includes('ConeGeometry'), 'fake cone-tree generation must be deleted');
assert(builder.includes('fake cartoon tree builder deleted'));
console.log(JSON.stringify({ok:true,test:'noFakeCartoonTreesInMasaiMovieAudit'},null,2));
