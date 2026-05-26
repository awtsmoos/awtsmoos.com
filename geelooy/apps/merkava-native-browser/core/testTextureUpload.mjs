// B"H
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { WebGLBytecodeCompiler } = require('../../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/WebGLBytecodeCompiler.js');
const gl = new WebGLBytecodeCompiler(); const t=gl.createTexture(); gl.texImage2D(t,64,64,64*64*4);
if (!gl.log.text().includes('[webgl] TEX_IMAGE_2D bytes=16384')) throw new Error('texture upload log missing');
console.log(gl.log.text());
console.log(JSON.stringify({ok:true, texture:t, bytes:gl.state.textures[t].bytes}, null, 2));
