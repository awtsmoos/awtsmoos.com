// B"H
/** Awtsmoos.com keeps the writer's destination choice explicit. */
import assert from 'node:assert/strict';
import {applyDefaultDestination} from '../js/destination/DefaultDestinationFlow.js';
const owned={heichelId:'community',name:'Community',role:'owner',actions:{content:{mode:'direct'}}};
let remembered=null;
const calls=[];
const panel={destinations:[owned],memory:{load:()=>remembered},choose:async (...args)=>calls.push(args)};
assert.equal(await applyDefaultDestination(panel,'author'),false);
assert.deepEqual(calls,[]);
remembered={heichelId:'missing',seriesId:'root'};
assert.equal(await applyDefaultDestination(panel,'author'),false);
assert.deepEqual(calls,[]);
remembered={heichelId:'community',seriesId:'songs'};
assert.equal(await applyDefaultDestination(panel,'author'),true);
assert.deepEqual(calls,[['community','songs']]);
panel.choose=async()=>{throw Error('Destination unavailable');};
assert.equal(await applyDefaultDestination(panel,'author'),false);
console.log('Explicit destination regression passed');
