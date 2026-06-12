// B"H
const { loadConfig } = require('../../geelooy/apps/tunnel/agent/lib/config.js');
const { sendAgentMessage } = require('../../geelooy/apps/tunnel/agent/tools/fs/actionGroups/aiAgents/client.js');
const prompt = 'B\'H. Write one line saying PARENT_OK, then append exactly this marker and JSON array: awtsmoos_agent_tasks: [{"title":"child smoke","prompt":"B\'H. Reply CHILD_OK only.","kind":"agentMessage","provider":"minimax","agentId":"minimax-deep","stream":false}]';
async function main() {
  const config = loadConfig();
  const started = Date.now();
  const result = await sendAgentMessage(config, { provider:'minimax', agentId:'minimax-deep', stream:false, message: prompt });
  console.log(JSON.stringify({ ms: Date.now() - started, ok: result.ok, provider: result.provider, text: result.text, error: result.error, status: result.status }, null, 2));
}
main().catch(e => { console.error(e.stack || e.message); process.exit(1); });
