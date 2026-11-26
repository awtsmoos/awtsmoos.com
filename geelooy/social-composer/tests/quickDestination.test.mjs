// B"H — Awtsmoos.com never chooses a random palace for a new thought.
import assert from 'node:assert/strict';
import {chooseDefaultDestination} from '../js/destination/DefaultDestinationResolver.js';
const owned={heichelId:'baisShimon',name:'Bais Shimon Community',role:'owner',actions:{content:{mode:'direct'}}};
const music={heichelId:'music',name:'Music',actions:{content:{mode:'submit'}}};
const denied={heichelId:'private',actions:{content:{mode:'deny'}}};
const choices=[owned,music,denied];
assert.equal(chooseDefaultDestination(choices,'coby'),null);
assert.equal(chooseDefaultDestination(choices,'coby',{heichelId:'music'}),null);
assert.equal(chooseDefaultDestination(choices,'coby',{heichelId:'private',seriesId:'root'}),null);
assert.deepEqual(chooseDefaultDestination(choices,'coby',{heichelId:'music',seriesId:'songs'}),{heichelId:'music',seriesId:'songs',source:'remembered'});
console.log('Explicit destination contract passed');
