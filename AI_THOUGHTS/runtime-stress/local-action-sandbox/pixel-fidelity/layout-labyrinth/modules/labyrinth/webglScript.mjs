// B"H
/**
 * WebGL client script. The Awtsmoos asks the runtime to record buffer, texture,
 * shader, program, and draw lifecycle so the software witness can paint state.
 */
export function webglScript() {
  return `const gl=document.getElementById('labgl').getContext('webgl');gl.viewport(0,0,260,118);gl.clearColor(.05,.02,.25,1);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-0.6,-0.6,0.7,-0.5,0.0,0.7]),gl.STATIC_DRAW);const t=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,2,2,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([255,0,0,255,0,255,255,255,255,255,0,255,255,0,255,255]));const vs=gl.createShader(gl.VERTEX_SHADER),fs=gl.createShader(gl.FRAGMENT_SHADER),pr=gl.createProgram();gl.shaderSource(vs,'attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}');gl.shaderSource(fs,'precision mediump float;void main(){gl_FragColor=vec4(1.,.35,.85,1.);}');gl.compileShader(vs);gl.compileShader(fs);gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.linkProgram(pr);gl.useProgram(pr);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,3);`;
}
