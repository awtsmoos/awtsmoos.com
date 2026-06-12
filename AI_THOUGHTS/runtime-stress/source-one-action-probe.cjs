// B"H
const { buildActions } = require('../../geelooy/apps/tunnel/agent/tools/fs/actions.js');
const config = { root: process.cwd(), allowWrite: true, allowSecrets: false, allowCommands: true, tools: { fsRead: true, fsWrite: true, fsBulk: true, fsList: true, fsTree: true, command: true, chrome: true } };
const rel = 'AI_THOUGHTS/runtime-stress/.tmp-pagination-tree';
const action = process.argv[2] || 'tree';
const payloads = {
  tree: { action: 'tree', p: rel, depth: 5, pageSize: 20, cursor: 0 },
  search: { action: 'search', path: rel, query: 'AWTS_STRESS_', pageSize: 25, maxResults: 25, maxFiles: 60 },
  bulk: { action: 'bulk', paths: Array.from({length:50},(_,i)=>`${rel}/src/file-${String(i).padStart(3,'0')}.js`).join('\n'), pageSize:10, maxFiles:10, maxChars:500, totalMaxChars:5000 },
  connectedFiles: { action: 'connectedFiles', path: `${rel}/src/entry.js`, maxDepth:2, pageSize:2, maxFiles:10, maxBytes:8000 },
  simulateRuntime: { action: 'simulateRuntime', engine:'auto', html:'<body><div id="ok">AUTO</div></body>', returnValues: JSON.stringify(['document.querySelector("#ok").textContent']), timeoutMs:10000 },
  nodeDom: { action: 'simulateRuntime', engine:'node-dom', html:'<body><div id="ok">NODE</div></body>', returnValues: JSON.stringify(['document.querySelector("#ok").textContent']), timeoutMs:10000 }
};
(async()=>{ const payload = payloads[action]; if(!payload) throw new Error('bad action '+action); const started=Date.now(); console.error('START '+action); const result = await buildActions(config,payload,null)[payload.action](); console.error('DONE '+action+' '+(Date.now()-started)); console.log(JSON.stringify({ok:result.ok,action:result.action,ms:Date.now()-started,partial:result.partial,returnedRows:result.returnedRows,returnedResults:result.returnedResults,returnedCount:result.returnedCount,count:result.count,engine:result.engine,autoRuntime:result.autoRuntime,error:result.error,keys:Object.keys(result).slice(0,30)},null,2)); })().catch(e=>{console.error('ERR '+e.stack);process.exit(1);});