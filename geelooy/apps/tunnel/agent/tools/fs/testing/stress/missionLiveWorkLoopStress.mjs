// B"H
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { buildActions } = require('../../actions.js');
const E = require('../../mission/eightStep/index.js');
const C = require('../../mission/response/compact.js');
const Firewall = require('../../mission/firewall/index.js');
const Policy = require('../../mission/activeGuard/policy.js');
const StepActions = require('../../actionGroups/missionEightStepActions.js');
const Lock = require('../../mission/lock/index.js');

const root = path.resolve('geelooy/apps/tunnel/agent/tools/fs/testing/.tmp-live-work-loop-real-write');
fs.rmSync(root, { recursive: true, force: true });
fs.mkdirSync(path.join(root, 'src'), { recursive: true });
fs.writeFileSync(path.join(root, 'src/target.js'), '// B"H\nmodule.exports = function before() { return "before"; };\n');

const config = { root, tunnelName: 'mission-live-work-loop', allowWrite: true, allowCommands: true, allowSecrets: false, tools: { fsRead: true, fsWrite: true, fsBulk: true, fsList: true, fsTree: true } };
Lock.set(config, { missionId: 'm-real-write', lastMustCallNext: { action: 'missionExecuteNext8', missionId: 'm-real-write' }, releaseStatus: 'locked' });
if (Firewall.classify('readManyLines') !== 'missionEvidence' || !Policy.allowed('readManyLines')) throw new Error('readManyLines is still not live mission evidence');
const tokened = StepActions.attachWriteToken(config, { missionId: 'm-real-write', liveActionToPerform: { action: 'write', path: 'src/target.js', content: 'x' } });
if (!tokened.liveActionToPerform?.missionWriteToken) throw new Error('write step did not receive missionWriteToken');

const mission = { id: 'm-real-write', goal: 'Fix src/target.js by rewriting the file and verifying it with node --check' };
const plan = E.plan(mission, {});
const readStep = plan.next8Steps.find(s => s.kind === 'read');
const writeStep = plan.next8Steps.find(s => s.kind === 'write');
const verifyStep = plan.next8Steps.find(s => s.kind === 'verify');
if (!readStep || !writeStep || !verifyStep) throw new Error('mission plan did not include read/write/verify');

const before = await buildActions(config, { action: 'readManyLines', ranges: [{ path: 'src/target.js', startLine: 1, endLine: 4 }] }, null).readManyLines();
E.execute(mission, { stepIndex: readStep.index });
E.review(mission, { stepIndex: readStep.index, evidence: 'readManyLines returned source' });
E.execute(mission, { stepIndex: writeStep.index });
const content = '// B"H\nmodule.exports = function after() { return "after"; };\n';
const writePayload = { ...tokened.liveActionToPerform, action: 'write', path: 'src/target.js', content, allowWrite: true };
const write = await buildActions(config, writePayload, null).write();
const after = await buildActions(config, { action: 'read', path: 'src/target.js' }, null).read();
const reviewWrite = E.review(mission, { stepIndex: writeStep.index, evidence: 'rewrote complete file with token', done: true });
E.execute(mission, { stepIndex: verifyStep.index });
const command = await buildActions(config, { action: 'commandRun', command: 'node --check src/target.js', cwd: '.', allowCommands: true, timeoutMs: 30000 }, null).commandRun();
const waited = await buildActions(config, { action: 'commandWait', jobId: command.jobId, timeoutMs: 30000, maxChars: 12000 }, null).commandWait();
const reviewVerify = E.review(mission, { stepIndex: verifyStep.index, evidence: 'node --check passed', done: true });
const compact = C.compact({ action: 'missionReviewNext8Step', missionId: mission.id, finalAnswerAllowed: false, mustContinue: true, ...reviewVerify }, { action: 'missionReviewNext8Step' });

const ok = before.ok !== false && write.ok !== false && String(after.content || '').includes('after') && waited.status === 'completed' && reviewWrite.filesTouched?.includes('src/target.js') && reviewVerify.testsRun >= 1 && compact.workQueue;
console.log(JSON.stringify({ ok, suite: 'mission-live-work-loop-stress', readManyLinesOk: before.ok !== false, writeOk: write.ok !== false, readAfterOk: String(after.content || '').includes('after'), verifyStatus: waited.status, filesTouched: reviewWrite.filesTouched, testsRun: reviewVerify.testsRun, debtShrank: reviewVerify.debtShrank, responseShape: compact.responseShape, workQueueRemaining: compact.workQueue?.remaining?.length, writeTokenUsed: !!writePayload.missionWriteToken }, null, 2));
if (!ok) process.exit(1);
