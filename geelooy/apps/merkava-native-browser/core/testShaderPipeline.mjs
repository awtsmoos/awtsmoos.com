// B"H
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { WebGLBytecodeCompiler } = require('../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/WebGLBytecodeCompiler.js');
const gl = new WebGLBytecodeCompiler(); const v=gl.createShader('vertex','void main(){}'); gl.compileShader(v); const f=gl.createShader('fragment','void main(){}'); gl.compileShader(f); const p=gl.createProgram(); gl.attachShader(p,v); gl.attachShader(p,f); gl.linkProgram(p); gl.useProgram(p);
if (!gl.state.program) throw new Error('program not active');
console.log(gl.log.text());
console.log(JSON.stringify({ok:true, program:gl.state.program, ops:gl.ops.length}, null, 2));
