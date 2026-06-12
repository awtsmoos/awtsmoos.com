// B"H
const path = require('path');
const home = process.env.USERPROFILE || process.env.HOME;
const installed = path.join(home, '.awtsmoos-tunnel', 'tools', 'fs', 'actionGroups', 'aiAgentActions.js');
const { actionPayload } = require(installed);
const cases = [
  actionPayload({ provider: 'minimax', agentId: 'minimax-deep', message: 'hi' }),
  actionPayload({ params: { provider: 'minimax', agentId: 'minimax-deep', message: 'hi' } }),
  actionPayload({ content: 'plain prompt' }),
  actionPayload({ content: '{"provider":"minimax","agentId":"minimax-deep","message":"hi"}' })
];
console.log(JSON.stringify(cases, null, 2));
if (cases.some(item => !item.message && !item.prompt)) process.exit(2);
if (cases[0].provider !== 'minimax' || cases[1].provider !== 'minimax' || cases[3].agentId !== 'minimax-deep') process.exit(3);
