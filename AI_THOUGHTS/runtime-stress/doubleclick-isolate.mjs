// B"H
import runtimePkg from '../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/RuntimeAssembler.js';
import { runBrowserActions } from '../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/browser-actions/runBrowserActions.js';
const { RuntimeAssembler } = runtimePkg;
const html = `<body><button id="dbl">Dbl</button><script>window.dbl=0;document.getElementById('dbl').addEventListener('click',()=>{window.dbl++;});</script></body>`;
const entry='virtual/double.html';
const out = await new RuntimeAssembler({ files: { [entry]: html }, entry, runtime: 'browser', waitMs: 0 }).run(entry);
const report = await runBrowserActions(out.runtime, [
  { action:'doubleClick', selector:'#dbl' },
  { action:'evaluate', source:'window.dbl' },
  { action:'waitForFunction', source:'window.dbl === 2', timeoutMs: 20 }
]);
console.log(JSON.stringify(report, null, 2));
