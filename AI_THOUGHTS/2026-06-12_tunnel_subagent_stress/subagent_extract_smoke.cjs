// B"H
const { extractChildren } = require('../../geelooy/apps/tunnel/agent/tools/fs/actionGroups/aiAgents/genericTask.js');
const sample = 'PARENT_OK\nawtsmoos_agent_tasks: [{"title":"child smoke","prompt":"B\\\"H. Reply CHILD_OK only.","kind":"agentMessage","provider":"minimax","agentId":"minimax-deep","stream":false}]';
console.log(JSON.stringify({ children: extractChildren(sample) }, null, 2));
