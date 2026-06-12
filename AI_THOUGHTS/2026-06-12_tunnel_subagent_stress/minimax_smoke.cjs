// B"H
const { loadConfig } = require('../../geelooy/apps/tunnel/agent/lib/config.js');
const { sendAgentMessage } = require('../../geelooy/apps/tunnel/agent/tools/fs/actionGroups/aiAgents/client.js');

async function main() {
  const config = loadConfig();
  const result = await sendAgentMessage(config, {
    provider: 'minimax',
    agentId: 'minimax-deep',
    stream: false,
    message: 'B"H. Reply exactly MINIMAX_OK'
  });
  const safe = { ...result };
  if (safe.raw) delete safe.raw;
  if (safe.reasoning) safe.reasoning = `[reasoning length ${safe.reasoning.length}]`;
  console.log(JSON.stringify(safe, null, 2));
}

main().catch(error => {
  console.error(error && (error.stack || error.message) || String(error));
  process.exit(1);
});
