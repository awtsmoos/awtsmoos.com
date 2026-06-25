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
async function main(){const root=await fs.mkdtemp(path.join(os.tmpdir(),'boss-protocol-'));const config={root};const s=await action(config,'missionStart',params({goal:'boss protocol',minimumInnovationWindowMs:0,minimumProductiveCycles:0,minimumProductiveMs:0}));const mid=s.missionId;const start=await action(config,'missionProtocolStart',params({missionId:mid,minimumProtocolCycles:1}));assert.equal(start.protocol.enabled,true);assert.equal(start.protocol.currentStage,'WILD_BRAINSTORM');const bad=await action(config,'missionProtocolStage',params({missionId:mid,stage:'FILE_TOUCH_MAP'}));assert.equal(bad.ok,true);assert.equal(bad.error,'stage_prerequisites_missing');const wild=await action(config,'missionProtocolStage',params({missionId:mid,stage:'WILD_BRAINSTORM'}));assert.equal(wild.stage.complete,true);assert.ok(wild.stage.queuedIdeas>=50);const prose=await action(config,'missionProtocolAnswer',params({missionId:mid,answer:'A continue'}));assert.equal(prose.protocolAnswer.ok,false);const good=await action(config,'missionProtocolAnswer',params({missionId:mid,multipleChoiceAnswer:'A'}));assert.equal(good.protocolAnswer.ok,true);const reality=await action(config,'missionProtocolStage',params({missionId:mid,stage:'REALITY_TRACK',content:'Concrete realistic track with enough detail and risk controls to pass scoring and continue.'}));assert.equal(reality.stage.complete,true);const status=await action(config,'missionProtocolStatus',params({missionId:mid}));assert.equal(status.protocol.currentStage,'FILE_TOUCH_MAP');console.log(JSON.stringify({ok:true,missionId:mid,root},null,2));}
main().catch(e=>{console.error(e);process.exit(1);});
