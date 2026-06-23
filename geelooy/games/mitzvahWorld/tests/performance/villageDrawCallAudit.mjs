// B"H
import { villagePropInstances } from '../../systems/buildings/VillagePropInstancer.js';
if(!villagePropInstances(7).every(x=>x.instanced)) throw new Error('Village props must be instanced');
console.log('B"H villageDrawCallAudit passed');
