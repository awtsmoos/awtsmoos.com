// B"H
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./RuntimeLog.js'));
  else { root.Merkava = root.Merkava || {}; root.Merkava.WebGLBytecodeCompiler = factory(root.Merkava).WebGLBytecodeCompiler; }
})(typeof self !== 'undefined' ? self : this, function(logMod) {
  const RuntimeLog = logMod.RuntimeLog;
  const OPS = Object.freeze({ CREATE_SHADER:1, SHADER_SOURCE:2, COMPILE_SHADER:3, CREATE_PROGRAM:4, ATTACH_SHADER:5, LINK_PROGRAM:6, USE_PROGRAM:7, CREATE_BUFFER:8, BIND_BUFFER:9, BUFFER_DATA:10, CREATE_TEXTURE:11, TEX_IMAGE_2D:12, UNIFORM:13, DRAW_ARRAYS:14, DRAW_ELEMENTS:15 });
  class WebGLBytecodeCompiler {
    constructor(options = {}) { this.log = options.log || new RuntimeLog('webgl'); this.ops = []; this.next = 1; this.state = { program: null, buffers: {}, textures: {}, shaders: {}, uniforms: {}, drawCalls: 0 }; }
    emit(op, payload = {}) { const record = { id: this.next++, op, code: OPS[op], payload }; this.ops.push(record); this.log.push('webgl', op, summarize(payload)); return record; }
    createShader(kind, source = '') { const id = 'shader' + this.next; this.state.shaders[id] = { kind, source, compiled: false }; this.emit('CREATE_SHADER', { id, kind }); if (source) this.shaderSource(id, source); return id; }
    shaderSource(id, source) { this.state.shaders[id] ||= {}; this.state.shaders[id].source = String(source); this.emit('SHADER_SOURCE', { id, bytes: String(source).length }); }
    compileShader(id) { this.state.shaders[id] ||= {}; this.state.shaders[id].compiled = true; this.emit('COMPILE_SHADER', { id, ok: true }); }
    createProgram() { const id = 'program' + this.next; this.state.programs ||= {}; this.state.programs[id] = { shaders: [], linked: false }; this.emit('CREATE_PROGRAM', { id }); return id; }
    attachShader(program, shader) { this.state.programs[program].shaders.push(shader); this.emit('ATTACH_SHADER', { program, shader }); }
    linkProgram(program) { this.state.programs[program].linked = true; this.emit('LINK_PROGRAM', { program, ok: true }); }
    useProgram(program) { this.state.program = program; this.emit('USE_PROGRAM', { program }); }
    createBuffer(bytes = 0) { const id = 'buffer' + this.next; this.state.buffers[id] = { bytes, target: null }; this.emit('CREATE_BUFFER', { id }); return id; }
    bindBuffer(target, buffer) { if (buffer) this.state.buffers[buffer].target = target; this.emit('BIND_BUFFER', { target, buffer }); }
    bufferData(target, data) { const bytes = byteLength(data); this.emit('BUFFER_DATA', { target, bytes }); }
    createTexture(width = 0, height = 0) { const id = 'texture' + this.next; this.state.textures[id] = { width, height }; this.emit('CREATE_TEXTURE', { id }); return id; }
    texImage2D(texture, width, height, bytes = width * height * 4) { this.state.textures[texture] = { width, height, bytes }; this.emit('TEX_IMAGE_2D', { texture, width, height, bytes }); }
    uniform(name, value) { this.state.uniforms[name] = value; this.emit('UNIFORM', { name, value }); }
    drawArrays(mode, first, count) { this.state.drawCalls++; this.emit('DRAW_ARRAYS', { mode, first, count, triangles: Math.floor(count / 3) }); }
    drawElements(mode, count, type, offset) { this.state.drawCalls++; this.emit('DRAW_ELEMENTS', { mode, count, type, offset }); }
    compileFromCanvasCommands(commands = []) { for (const cmd of commands) this.lowerCanvasCommand(cmd); return this.ops; }
    lowerCanvasCommand(cmd) { const op = cmd.op || cmd.name || ''; if (op.includes('drawArrays')) this.drawArrays(cmd.mode || 'TRIANGLES', cmd.first || 0, cmd.count || 3); else if (op.includes('bufferData')) this.bufferData(cmd.target || 'ARRAY_BUFFER', cmd.data || cmd.bytes || 0); else if (op.includes('texImage2D')) this.texImage2D(cmd.texture || 'texture0', cmd.width || 1, cmd.height || 1, cmd.bytes); else this.emit('UNIFORM', { loweredFrom: op || 'unknown' }); }
    toBytecode() { return Buffer.from(JSON.stringify({ kind: 'webgl-bytecode', version: 1, ops: this.ops }), 'utf8'); }
  }
  function byteLength(data) { if (typeof data === 'number') return data; if (data?.byteLength != null) return data.byteLength; if (Array.isArray(data)) return data.length * 4; return Buffer.byteLength(String(data || ''), 'utf8'); }
  function summarize(payload) { if ('bytes' in payload) return { bytes: payload.bytes }; if ('triangles' in payload) return { triangles: payload.triangles }; if ('kind' in payload) return { kind: payload.kind }; if ('ok' in payload) return { ok: payload.ok }; return payload; }
  return { WebGLBytecodeCompiler, OPS };
});
