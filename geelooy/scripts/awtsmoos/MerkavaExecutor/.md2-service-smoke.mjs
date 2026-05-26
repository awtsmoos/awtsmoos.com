// B"H
import { simulateRuntime, simulateMd2Runtime, compileMd2Runtime, inspectMd2 } from './merkava-service/index.js';

const files = {
  'index.html': '<main id="out"></main><script>const msg="BH MD2 Service"; out.textContent=msg;</script>'
};

const viaSim = await simulateRuntime({ engine: 'md2', files, entry: 'index.html' });
const direct = await simulateMd2Runtime({ files, entry: 'index.html' });
const compiled = await compileMd2Runtime({ files, entry: 'index.html' });
const inspected = inspectMd2(compiled.bytecode);

console.log(JSON.stringify({
  viaSimOk: viaSim.ok,
  viaSimEngine: viaSim.engine,
  viaSimBytes: viaSim.bytecode.bytes,
  directOk: direct.ok,
  directEngine: direct.engine,
  compiledOk: compiled.ok,
  inspectedOk: inspected.ok,
  inspectedKind: inspected.kind
}, null, 2));
