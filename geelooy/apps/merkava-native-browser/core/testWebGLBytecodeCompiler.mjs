// B"H
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PersistentBrowserRuntime } = require('../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/PersistentBrowserRuntime.js');
const rt = new PersistentBrowserRuntime();
const out = rt.compileWebGLDemo();
for (const op of ['CREATE_SHADER','COMPILE_SHADER','LINK_PROGRAM','BUFFER_DATA','DRAW_ARRAYS']) if (!rt.report().log.includes('[webgl] '+op)) throw new Error('missing '+op);
console.log(rt.report().log);
console.log(JSON.stringify({ok:true, ops:out.ops.length, bytes:out.bytes}, null, 2));
