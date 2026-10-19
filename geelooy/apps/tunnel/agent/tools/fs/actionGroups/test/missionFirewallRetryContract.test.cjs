// B"H — Proves the exact denied write becomes an authorized retry, not a planning loop.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Firewall = require('../../mission/firewall/index.js');
const Finish = require('../../actionFinish.js');
const Envelope = require('../../../../lib/runtime/envelope-compact.js');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-mission-retry-'));
const config = {root:dir,repoRoot:dir};
const active = {missionId:'mission-retry-contract',lastMustCallNext:{action:'missionNext8Plan'}};
const payload = {action:'write',path:'ayzarim/glyph-engine/session-budget.cjs',content:'B"H test',missionId:active.missionId};
try {
  const denied=Firewall.check(config,'write',active,payload);
  assert.equal(denied.error,'mission_step_authorization_required');
  assert.ok(denied.missionWriteToken.startsWith('wrt_'));
  assert.ok(Date.parse(denied.missionWriteTokenExpiresAt)>Date.now());
  const response=Envelope.compactMissionSurface(Finish.firewallBlock('write',denied,active,payload),payload);
  assert.equal(response.error,'mission_step_authorization_required');
  assert.equal(response.executionCompleted,false);
  assert.equal(response.mustCallNext.action,'write');
  assert.equal(response.nextRequiredToolCall.action,'write');
  assert.equal(response.nextRequiredToolCall.path,payload.path);
  assert.equal(response.nextRequiredToolCall.missionId,active.missionId);
  assert.equal(response.nextRequiredToolCall.missionWriteToken,denied.missionWriteToken);
  assert.equal(response.authorizationRetry.originalPayloadRequired,true);
  assert.equal(response.mission.why,'mission_step_authorization_required');
  assert.ok(!JSON.stringify(response).includes(payload.content));
  const wrong=Firewall.check(config,'write',active,{...payload,path:'another.cjs',missionWriteToken:denied.missionWriteToken});
  assert.equal(wrong.ok,false);
  const allowed=Firewall.check(config,'write',active,{...payload,missionWriteToken:response.nextRequiredToolCall.missionWriteToken});
  assert.equal(allowed.ok,true);
  assert.equal(allowed.authorized,true);
  const replay=Firewall.check(config,'write',active,{...payload,missionWriteToken:denied.missionWriteToken});
  assert.equal(replay.ok,false);
  const planning=Envelope.compactMissionSurface({ok:true,action:'missionNext8Plan',missionId:active.missionId,finalAnswerAllowed:false,mustContinue:true},{action:'missionNext8Plan'});
  assert.equal(planning.mission.why,'continuation_required');
  console.log(JSON.stringify({ok:true,denyThenAuthorized:true,originalWriteNeverReplayed:true,replayDenied:true,misleadingPlanningBlockRemoved:true}));
} finally {
  fs.rmSync(dir,{recursive:true,force:true});
}
