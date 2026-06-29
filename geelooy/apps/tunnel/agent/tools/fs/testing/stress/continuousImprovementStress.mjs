// B"H
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { buildActions } = require('../../actionBuilders.js');
const root = path.resolve('geelooy/apps/tunnel/agent/tools/fs/testing/.tmp-continuous-improvement');
fs.rmSync(root, { recursive:true, force:true });
fs.mkdirSync(path.join(root, 'src'), { recursive:true });
fs.writeFileSync(path.join(root, 'src/big.js'), Array.from({length:135}, (_,i)=> i===20 ? '// TODO fix spark' : `const line${i}= ${i};`).join('\n'));
fs.writeFileSync(path.join(root, 'src/small.js'), '// B"H\nmodule.exports = 1;\n');
const config = { root, allowCommands:true, allowWrite:true, allowSecrets:false };
const actions = buildActions(config, { action:'missionImprovementPlan', path:'.', limit:10, maxItems:4 }, null);
const out = await actions.missionImprovementPlan();
const tx = await buildActions(config, { action:'missionTransactionPlan', path:'.', limit:10, maxItems:4 }, null).missionTransactionPlan();
const dash = await buildActions(config, { action:'missionImprovementDashboard', path:'.', limit:10, maxItems:4 }, null).missionImprovementDashboard();
const ok = out.ok && out.simulation.length > 0 && out.transaction.steps.length > 0 && tx.transaction.gates.length >= 4 && dash.topDebt.length > 0 && out.mustCallNext?.action;
console.log(JSON.stringify({ ok, suite:'continuous-improvement-stress', top:dash.topDebt[0], next:out.mustCallNext, transactionSteps:out.transaction.steps.length, gates:tx.transaction.gates.length }, null, 2));
if (!ok) process.exit(1);
