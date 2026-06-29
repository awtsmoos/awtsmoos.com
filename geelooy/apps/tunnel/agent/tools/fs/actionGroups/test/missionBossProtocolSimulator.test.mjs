// B"H
import { createRequire } from 'module';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import assert from 'assert/strict';
const require = createRequire(import.meta.url);
const { buildMissionActions } = require('../missionActions.js');
async function action(config,name,payload={}){const actions=buildMissionActions({config,payload:{action:name,...payload}});const out=await actions[name]();assert.equal(out.ok,true);assert.equal(out.action,name);return out;}
const params=v=>({params:JSON.stringify(v)});
async function main(){const root=await fs.mkdtemp(path.join(os.tmpdir(),'boss-sim-'));const config={root};const s=await action(config,'missionStart',params({goal:'boss sim',minimumInnovationWindowMs:0,minimumProductiveCycles:0,minimumProductiveMs:0}));const mid=s.missionId;const sim=await action(config,'missionProtocolSimulate',params({missionId:mid,cycles:12}));assert.equal(sim.simulation.ok,true);assert.equal(sim.simulation.protocol.completedCycles,12);assert.equal(sim.simulation.protocol.currentCycle,13);assert.ok(sim.simulation.artifacts.some(a=>a.exists));const early=await action(config,'missionFinalize',params({missionId:mid,minimumProductiveCycles:0,minimumProductiveMs:0}));assert.equal(early.finalizationAttempt.finalized,false);assert.ok(early.finalizationAttempt.verdict.issues.includes('continuation_queue_required_open'));console.log(JSON.stringify({ok:true,missionId:mid,root,cycles:sim.simulation.protocol.completedCycles},null,2));}
main().catch(e=>{console.error(e);process.exit(1);});
