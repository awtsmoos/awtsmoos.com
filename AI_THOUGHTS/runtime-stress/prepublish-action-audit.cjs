// B"H
const { buildActions } = require('../../geelooy/apps/tunnel/agent/tools/fs/actions.js');
const config = { root: process.cwd(), allowWrite: true, allowSecrets: false, allowCommands: true, enableLocalHttpProxy: true, tools: { fsRead: true, fsWrite: true, fsBulk: true, fsList: true, fsTree: true, command: true, chrome: true, browser: true } };
const actions = Object.keys(buildActions(config, { action: 'list' }, null)).sort();
const groups = {
  critical: ['list','tree','read','bulk','search','write','bulkWrite','connectedFiles','simulateRuntime','runtime','agent','aiAgentMessage','command','shellSyntaxTranslator','chromeLaunch','chromeEval','staticServerStart','serverStart','httpRequest'],
  aliases: ['find','findFiles','grep','rg','rgbgrep','md','read64','readBytes','readLines','readManyLines','selectString','selectStringFile'],
  risky: ['applyPatch','replaceRange','replaceFunction','insertAfterFunction','deleteFile','deleteTree','moveFile','moveTree','portKillSafe','processKillSafe'],
  newOnes: ['chatgptLogin','chatgptMessage','chatgptContinueConversation','search','agent','runtime']
};
const missing = Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, v.filter(x => !actions.includes(x))]));
console.log(JSON.stringify({ actionCount: actions.length, missing, hasModeActions: ['read','write','search','tree','runtime','agent'].every(x => actions.includes(x)), first: actions.slice(0, 15), last: actions.slice(-15) }, null, 2));
