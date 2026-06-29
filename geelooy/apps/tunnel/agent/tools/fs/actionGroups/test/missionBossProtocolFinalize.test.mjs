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
async function main(){const root=await fs.mkdtemp(path.join(os.tmpdir(),'boss-final-'));const config={root};const s=await action(config,'missionStart',params({goal:'boss final',definitionOfDone:['final proof'],minimumInnovationWindowMs:0,minimumProductiveCycles:1,minimumProductiveMs:1}));const mid=s.missionId;await action(config,'missionProtocolSimulate',params({missionId:mid,cycles:1}));const task=await action(config,'missionAddTask',params({missionId:mid,title:'prove boss final'}));const ev=await action(config,'missionEvidence',params({missionId:mid,claim:'final proof',kind:'test',proof:'boss final proof'}));await action(config,'missionCompleteTask',params({missionId:mid,taskId:task.task.id,evidenceId:ev.evidence.id}));await action(config,'missionQuestion',params({missionId:mid,answer:'E'}));await action(config,'missionCycle',params({missionId:mid,inspection:'i',plan:'p',verification:'v',selfCritique:'c',nextIdeas:['n'],productiveMs:1}));let q=await action(config,'missionQueueStatus',params({missionId:mid}));for(const item of q.queue.items.filter(x=>x.status!=='done'&&(x.required||x.severity==='P1')))await action(config,'missionQueueComplete',params({missionId:mid,queueId:item.id,proof:'done'}));const verdict=await action(config,'missionProtocolFinalizeCheck',params({missionId:mid}));assert.equal(verdict.verdict.ok,true);const fin=await action(config,'missionFinalize',params({missionId:mid,minimumProductiveCycles:1,minimumProductiveMs:1}));assert.equal(fin.finalizationAttempt.finalized,true);assert.equal(fin.finalAnswerAllowed,true);console.log(JSON.stringify({ok:true,missionId:mid,root},null,2));}
main().catch(e=>{console.error(e);process.exit(1);});
