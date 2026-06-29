// B"H

/** B"H: Shader errors must speak before the frame pretends to live. */
export function makeProgram(gl, vertex, fragment) {
  const program = gl.createProgram();
  gl.attachShader(program, shader(gl, gl.VERTEX_SHADER, vertex));
  gl.attachShader(program, shader(gl, gl.FRAGMENT_SHADER, fragment));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(program));
  return program;
}

function shader(gl, type, source) {
  const out = gl.createShader(type);
  gl.shaderSource(out, source);
  gl.compileShader(out);
  if (!gl.getShaderParameter(out, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(out));
  return out;
}
