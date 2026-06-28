// B"H
import { parseExports, parseImports, resolveImport } from './ImportContractScanner.mjs';
function assert(ok,msg){ if(!ok) throw new Error(msg); }
const source = `
import A, {b as c, d} from './x.js';
import './side.js';
const m = import('./dyn.js');
`;
const imports = parseImports(source);
assert(imports.length === 3, `should parse static, side, dynamic imports; got ${imports.length}`);
assert(imports[0].wants.default && imports[0].wants.named.includes('b') && imports[0].wants.named.includes('d'), 'should parse wanted exports');
const exports = parseExports(`export default class A{};\nexport function b(){};\nexport { z as q };\nexport const d=1;`);
assert(exports.default && exports.named.includes('b') && exports.named.includes('z') && exports.named.includes('d'), 'should parse exports');
const resolved = resolveImport('/games/mitzvahWorld/index.js?v=x', null);
assert(resolved.exists && resolved.path.endsWith('/index.js'), 'should map /games/mitzvahWorld to repo');
console.log(JSON.stringify({ok:true, imports:imports.length, exports:exports.named}, null, 2));
