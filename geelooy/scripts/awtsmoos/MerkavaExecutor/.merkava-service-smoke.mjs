// B"H
import { simulateRuntime, simulateMerkavaRuntime, compileMerkavaRuntime, inspectMerkava } from './merkava-service/index.js';

const files = {
  'index.html': '<main id="out"></main><script>const msg="BH Merkava Service"; out.textContent=msg;</script>'
};

const viaDefault = await simulateRuntime({ files, entry: 'index.html' });
const viaSim = await simulateRuntime({ engine: 'merkava', files, entry: 'index.html' });
const direct = await simulateMerkavaRuntime({ files, entry: 'index.html' });
const compiled = await compileMerkavaRuntime({ files, entry: 'index.html' });
const inspected = inspectMerkava(compiled.bytecode);

console.log(JSON.stringify({
  defaultOk: viaDefault.ok,
  defaultEngine: viaDefault.engine,
  viaSimOk: viaSim.ok,
  viaSimEngine: viaSim.engine,
  viaSimBytes: viaSim.bytecode.bytes,
  directOk: direct.ok,
  directEngine: direct.engine,
  compiledOk: compiled.ok,
  inspectedOk: inspected.ok,
  inspectedKind: inspected.kind
}, null, 2));
